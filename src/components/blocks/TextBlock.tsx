import type { TextBlockView } from '../../features/blocks/view';
import { cx } from '../ui/styles';
import { blockMeasureClassName } from './blockStyles';
import RichText from './RichText';

export default function TextBlock({ block }: { block: TextBlockView }) {
  return <RichText source={block.body} className={cx(blockMeasureClassName, 'text-copy text-body')} />;
}
