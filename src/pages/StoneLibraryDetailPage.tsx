import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import RouteState from '../components/RouteState';
import ProjectService, { type StoneProjectUsage } from '../service/ProjectService';
import StoneLibraryService from '../service/StoneLibraryService';
import StonePageView from './StonePageView';
import type { StoneDetailVM } from '../types/stone-library';
export default function StoneLibraryDetailPage() {
  const { stoneGroupId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const variant = params.get('variant') || '';
  const [detail, setDetail] = useState<StoneDetailVM | null>(null);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const [usages, setUsages] = useState<StoneProjectUsage[]>([]);
  useEffect(() => {
    // Reverse Project references load independently and never block the detail state.
    let active = true;
    setUsages([]);
    ProjectService.getProjectsUsingStone(stoneGroupId)
      .then((next) => {
        if (active) setUsages(next);
      })
      .catch(() => {
        if (active) setUsages([]);
      });
    return () => {
      active = false;
    };
  }, [stoneGroupId]);
  useEffect(() => {
    let active = true;
    setStatus('loading');
    setDetail((current) =>
      current?.stoneGroupId === stoneGroupId ? current : null,
    );
    StoneLibraryService.getPublishedStoneDetail(
      stoneGroupId,
      variant || undefined,
    )
      .then((next) => {
        if (active) {
          setDetail(next);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [stoneGroupId, variant, retry]);
  if (status === 'loading' && !detail)
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing stone detail"
        copy="Loading the latest stone information."
        headerOffset
      />
    );
  if (status === 'error')
    return (
      <>
        <RouteState
          eyebrow="Stone Library"
          title="Stone detail could not load"
          copy="Please retry to load the latest information."
          headerOffset
        />
        <div className="urblo-page-container pb-12">
          <button
            className="urblo-button"
            onClick={() => setRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      </>
    );
  if (!detail)
    return (
      <RouteState
        eyebrow="Stone Library"
        title="Stone not found"
        copy="This stone is no longer available on the website."
        headerOffset
        actions={[{ label: 'Stone Library', to: '/stone-library' }]}
      />
    );
  return (
    <StonePageView
      refreshing={status === 'loading'}
      key={stoneGroupId}
      detail={detail}
      initialFinish={params.get('finish')}
      projectUsages={usages}
      onVariantChange={(id) => setParams({ variant: id }, { replace: true })}
      onFinishChange={(next) => setParams(next, { replace: true })}
    />
  );
}
