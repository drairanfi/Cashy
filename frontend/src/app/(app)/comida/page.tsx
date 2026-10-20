import type { Metadata } from 'next';

import { UnderConstruction } from '@/components/templates/under-construction';

export const metadata: Metadata = {
  title: 'Comida'
};

export default function FoodPage() {
  return <UnderConstruction />;
}
