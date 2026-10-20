import { Construction } from 'lucide-react';

import { commonMessages } from '@/config/messages';

export function UnderConstruction() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="flex flex-col items-center gap-2">
        <Construction className="size-8 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">
          {commonMessages.underConstruction.title}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {commonMessages.underConstruction.text}
        </p>
      </div>
    </div>
  );
}
