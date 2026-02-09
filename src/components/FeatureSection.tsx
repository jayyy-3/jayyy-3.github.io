import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTabs from './BottomTabs';
import SustainabilityPanel from './panels/SustainabilityPanel';
import InstallStepsPanel from './panels/InstallStepsPanel';
import CostComparePanel from './panels/CostComparePanel';
import ProcessSliderPanel from './panels/ProcessSliderPanel';

const PANELS = [
    { key: 'feature_0', title: 'Sustainability', icon: <SustainIcon /> },
    { key: 'feature_1', title: 'Streamline Installation', icon: <InstallIcon /> },
    { key: 'feature_2', title: 'Cost Saving', icon: <CostIcon /> },
    { key: 'feature_3', title: 'Design Collaboration', icon: <DesignIcon /> }
] as const;

export default function FeatureSection() {
    const [active, setActive] = useState<(typeof PANELS)[number]['key']>('feature_0');

    const renderPanel = () => {
        switch (active) {
            case 'feature_0': return <SustainabilityPanel />;
            case 'feature_1': return <InstallStepsPanel />;
            case 'feature_2': return <CostComparePanel />;
            case 'feature_3': return <ProcessSliderPanel />;
            default:          return null;
        }
    };

    return (
        <section className="relative w-full py-12">
            {/* Panel container */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                    {renderPanel()}
                </motion.div>
            </AnimatePresence>

            {/* Bottom tab bar */}
            <BottomTabs
                items={PANELS}
                activeKey={active}
                onChange={(k) => setActive(k)}
            />
        </section>
    );
}

/* ——示例 SVG 先留空壳—— */
function SustainIcon() { return <svg width="24" height="24" /> }
function InstallIcon() { return <svg width="24" height="24" /> }
function CostIcon()    { return <svg width="24" height="24" /> }
function DesignIcon()  { return <svg width="24" height="24" /> }
