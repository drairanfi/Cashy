import { ListSkeleton } from '@/components/molecules/list-skeleton';
import type { Modulo, ModuloPersonalizado } from '@/types/modulo.types';

import { MODULOS_OPCIONALES, type ModuloOpcionalDefinition } from '../../config';
import { modulosMessages } from '../../messages';
import { ModuloCard } from '../molecules/modulo-card';

interface ModulosSectionProps {
  modulos: Modulo[];
  modulosPersonalizados: ModuloPersonalizado[];
  isLoading: boolean;
  onToggle: (modulo: ModuloOpcionalDefinition, activo: boolean) => void;
  onDelete: (modulo: ModuloOpcionalDefinition) => void;
  onTogglePersonalizado: (modulo: ModuloPersonalizado) => void;
  onDeletePersonalizado: (modulo: ModuloPersonalizado) => void;
}

export function ModulosSection({
  modulos,
  modulosPersonalizados,
  isLoading,
  onToggle,
  onDelete,
  onTogglePersonalizado,
  onDeletePersonalizado
}: ModulosSectionProps) {
  if (isLoading) return <ListSkeleton count={4} />;

  return (
    <section className="flex flex-col gap-2">
      {MODULOS_OPCIONALES.map(definition => {
        const activo = modulos.find(modulo => modulo.clave === definition.clave)?.activo ?? false;
        return (
          <ModuloCard
            key={definition.clave}
            label={definition.label}
            href={definition.href}
            activo={activo}
            onToggle={() => onToggle(definition, !activo)}
            onDelete={() => onDelete(definition)}
          />
        );
      })}
      {modulosPersonalizados.length === 0 ? (
        <p className="text-sm text-muted-foreground">{modulosMessages.custom.empty}</p>
      ) : (
        modulosPersonalizados.map(modulo => (
          <ModuloCard
            key={modulo.id}
            label={modulo.nombre}
            href={`/modulos/${modulo.id}`}
            activo={modulo.activo}
            onToggle={() => onTogglePersonalizado(modulo)}
            onDelete={() => onDeletePersonalizado(modulo)}
          />
        ))
      )}
    </section>
  );
}
