import { useEffect, useState } from 'react';
import { useCreateGasto } from '@/hooks/useGastos';
import { useCreateComida } from '@/hooks/useComidas';
import { useCreateGimnasio } from '@/hooks/useGimnasio';
import { ModalGasto, type GastoFormData } from '@/components/organisms/ModalGasto';
import { Button } from '@/components/atoms/Button';

type TipoRapido = 'gasto' | 'comida' | 'gimnasio';

interface TipoConfig {
  value: TipoRapido;
  label: string;
  title: string;
  labelDescripcion: string;
  submitLabel: string;
  feedback: string;
}

const TIPOS: TipoConfig[] = [
  {
    value: 'gasto',
    label: 'Gasto',
    title: 'Agregar gasto',
    labelDescripcion: 'Gasto',
    submitLabel: 'Guardar gasto',
    feedback: 'Gasto registrado',
  },
  {
    value: 'comida',
    label: 'Comida',
    title: 'Agregar comida',
    labelDescripcion: 'Comida',
    submitLabel: 'Guardar comida',
    feedback: 'Comida registrada',
  },
  {
    value: 'gimnasio',
    label: 'Gimnasio',
    title: 'Agregar actividad',
    labelDescripcion: 'Actividad',
    submitLabel: 'Guardar actividad',
    feedback: 'Actividad registrada',
  },
];

export function RegistroRapido() {
  const [tipo, setTipo] = useState<TipoRapido>('gasto');
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const createGasto = useCreateGasto();
  const createComida = useCreateComida();
  const createGimnasio = useCreateGimnasio();

  const config = TIPOS.find((item) => item.value === tipo)!;
  const submitting =
    tipo === 'gasto'
      ? createGasto.isPending
      : tipo === 'comida'
        ? createComida.isPending
        : createGimnasio.isPending;

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSave = async (data: GastoFormData) => {
    if (tipo === 'gasto') {
      await createGasto.mutateAsync({
        descripcion: data.descripcion,
        monto: data.monto,
        categoria: data.categoria!,
      });
    } else if (tipo === 'comida') {
      await createComida.mutateAsync({ descripcion: data.descripcion, monto: data.monto });
    } else {
      await createGimnasio.mutateAsync({ actividad: data.descripcion, monto: data.monto });
    }
    setFeedback(config.feedback);
  };

  return (
    <section className="registro-rapido" aria-label="Registro rápido">
      <div className="registro-rapido__header">
        <h2 className="registro-rapido__title">Registro rápido</h2>
        {feedback && (
          <span className="registro-rapido__feedback" role="status">
            {feedback}
          </span>
        )}
      </div>
      <div className="registro-rapido__controls">
        <div className="segmented" role="radiogroup" aria-label="Tipo de movimiento">
          {TIPOS.map((item) => (
            <label
              key={item.value}
              className={`segmented__option${tipo === item.value ? ' segmented__option--active' : ''}`}
            >
              <input
                type="radio"
                name="tipo-movimiento-rapido"
                className="segmented__input"
                value={item.value}
                checked={tipo === item.value}
                onChange={() => setTipo(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
        <Button onClick={() => setModalOpen(true)}>Registrar</Button>
      </div>
      <ModalGasto
        key={tipo}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        submitting={submitting}
        title={config.title}
        labelDescripcion={config.labelDescripcion}
        submitLabel={config.submitLabel}
        conCategoria={tipo === 'gasto'}
      />
    </section>
  );
}
