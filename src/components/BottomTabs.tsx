interface TabItem {
    key: string;
    title: string;
    icon: React.ReactNode;
}
interface Props {
    items: readonly TabItem[];
    activeKey: string;
    onChange: (k: TabItem['key']) => void;
}

export default function BottomTabs({ items, activeKey, onChange }: Props) {
    return (
        <nav
            className="pointer-events-auto mt-10 flex flex-wrap
                 justify-center gap-4 md:gap-8"
            role="tablist"
            aria-label="Feature navigation"
        >
            {items.map((it) => {
                const selected = activeKey === it.key;
                return (
                    <button
                        key={it.key}
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(it.key)}
                        className={`group flex w-32 flex-col items-center px-4 py-2
              transition-colors duration-200 focus:outline-none
              ${selected ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                    >
                        <span className="h-8 w-8">{it.icon}</span>
                        <span className="mt-1 truncate text-center text-xs font-medium">
              {it.title}
            </span>
                        <span
                            className={`mt-1 block h-1 w-1 rounded-full transition
                ${selected ? 'scale-100 bg-black' : 'scale-0 bg-transparent'}`}
                        />
                    </button>
                );
            })}
        </nav>
    );
}