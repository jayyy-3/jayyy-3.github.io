export interface CompanyLocations {
  office: string;
  warehouse: string;
}

export const defaultCompanyLocations: CompanyLocations = {
  office: 'Suite 375, Level2, UL40 1341 Dandenong Road, Malvern East 3145',
  warehouse: '457-461 Springvale Rd, Glen Waverley VIC 3150',
};

export const companyLocationLabels = { office: 'Office', warehouse: 'Warehouse' } as const;
export const companyAddressMaxLength = 160;

type FooterColumn = { title: string; items: Record<string, unknown>[] };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function isCompanyAddressItem(item: unknown) {
  return isRecord(item) && typeof item.value === 'string' &&
    typeof item.label === 'string' && /^(office|warehouse|address)$/i.test(item.label.trim());
}

export function readCompanyLocations(columns: unknown): CompanyLocations {
  const locations = { ...defaultCompanyLocations };
  if (!Array.isArray(columns)) return locations;
  for (const column of columns) {
    if (!isRecord(column) || !Array.isArray(column.items)) continue;
    for (const item of column.items) {
      if (!isRecord(item) || typeof item.label !== 'string' || typeof item.value !== 'string') continue;
      const key = item.label.trim().toLowerCase();
      const value = item.value.replace(/\s+/g, ' ').trim();
      if ((key === 'office' || key === 'warehouse') && value && value.length <= companyAddressMaxLength) {
        locations[key] = value;
      }
    }
  }
  return locations;
}

/** Addresses remain ordinary text items in the existing Settings footer JSON. */
export function writeCompanyLocations(columns: unknown, locations: CompanyLocations): FooterColumn[] {
  const result: FooterColumn[] = Array.isArray(columns) ? columns.filter(isRecord).map(column => ({
    title: typeof column.title === 'string' ? column.title : '',
    items: Array.isArray(column.items) ? column.items.filter(isRecord).filter(item => !isCompanyAddressItem(item)) : [],
  })) : [];
  let contact = result.find(column => column.title.trim().toLowerCase() === 'contact');
  if (!contact) {
    contact = { title: 'Contact', items: [] };
    result.unshift(contact);
  }
  for (const key of ['office', 'warehouse'] as const) {
    contact.items.push({ label: companyLocationLabels[key], value: locations[key].replace(/\s+/g, ' ').trim() });
  }
  return result.filter(column => column.items.length > 0);
}

export function companyLocationSchema(locations: CompanyLocations) {
  return {
    address: locations.office,
    location: (['office', 'warehouse'] as const).map(key => ({
      '@type': 'Place', name: companyLocationLabels[key], address: locations[key],
    })),
  };
}
