import { useState, useEffect, useCallback } from 'react';
import { PetOptionEntity } from '../../domain/entities/mascota/PetOption';
import { ManagePetOptionsUseCase } from '../../domain/usecases/admin/ManagePetOptionsUseCase';
import { AdminPetOptionRepositoryImpl } from '../../data/repositories/admin/AdminPetOptionRepositoryImpl';

const repository = new AdminPetOptionRepositoryImpl();
const managePetOptionsUseCase = new ManagePetOptionsUseCase(repository);

// Etapas y umbrales de ejemplo — un punto de partida razonable, no un
// diseño final. Todo esto (nombres, emojis, puntos necesarios) se puede
// editar libremente desde el panel de administración después de sembrarlo.
const DEFAULT_PET_OPTIONS: Omit<PetOptionEntity, 'id'>[] = [
  {
    name: 'Sapo',
    emoji: '🐸',
    unlockDays: 0,
    stages: [
      { id: 'huevo', name: 'Huevo', emoji: '🥚', imageUrl: null, minGrowth: 0 },
      { id: 'renacuajo', name: 'Renacuajo', emoji: '🐡', imageUrl: null, minGrowth: 60 },
      { id: 'sapito', name: 'Sapito', emoji: '🐸', imageUrl: null, minGrowth: 150 },
      { id: 'sapo-adulto', name: 'Sapo adulto', emoji: '🐸', imageUrl: null, minGrowth: 300 },
    ],
  },
  {
    name: 'Ballena',
    emoji: '🐋',
    unlockDays: 15,
    stages: [
      { id: 'ballenato', name: 'Ballenato', emoji: '🐋', imageUrl: null, minGrowth: 0 },
      { id: 'ballena-joven', name: 'Ballena joven', emoji: '🐳', imageUrl: null, minGrowth: 120 },
      { id: 'ballena-adulta', name: 'Ballena adulta', emoji: '🐋', imageUrl: null, minGrowth: 280 },
    ],
  },
  {
    name: 'Perezoso',
    emoji: '🦥',
    unlockDays: 30,
    stages: [
      { id: 'bebe-perezoso', name: 'Bebé perezoso', emoji: '🦥', imageUrl: null, minGrowth: 0 },
      { id: 'perezoso-joven', name: 'Perezoso joven', emoji: '🦥', imageUrl: null, minGrowth: 150 },
      { id: 'perezoso-adulto', name: 'Perezoso adulto', emoji: '🦥', imageUrl: null, minGrowth: 320 },
    ],
  },
  {
    name: 'Abeja',
    emoji: '🐝',
    unlockDays: 60,
    stages: [
      { id: 'larva', name: 'Larva', emoji: '🐛', imageUrl: null, minGrowth: 0 },
      { id: 'abeja-joven', name: 'Abeja joven', emoji: '🐝', imageUrl: null, minGrowth: 150 },
      { id: 'abeja-adulta', name: 'Abeja adulta', emoji: '🐝', imageUrl: null, minGrowth: 320 },
    ],
  },
  {
    name: 'Polilla',
    emoji: '🦋',
    unlockDays: 100,
    stages: [
      { id: 'huevo-polilla', name: 'Huevo', emoji: '🥚', imageUrl: null, minGrowth: 0 },
      { id: 'oruga', name: 'Oruga', emoji: '🐛', imageUrl: null, minGrowth: 80 },
      { id: 'crisalida', name: 'Crisálida', emoji: '🍃', imageUrl: null, minGrowth: 200 },
      { id: 'polilla-adulta', name: 'Polilla adulta', emoji: '🦋', imageUrl: null, minGrowth: 400 },
    ],
  },
];

export function useAdminPetOptions() {
  const [petOptions, setPetOptions] = useState<PetOptionEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await managePetOptionsUseCase.getAll();
      setPetOptions(result.sort((a, b) => a.unlockDays - b.unlockDays));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPetOption = async (data: Omit<PetOptionEntity, 'id'>) => {
    await managePetOptionsUseCase.create(data);
    await load();
  };

  const updatePetOption = async (id: string, data: Omit<PetOptionEntity, 'id'>) => {
    await managePetOptionsUseCase.update(id, data);
    await load();
  };

  const deletePetOption = async (id: string) => {
    await managePetOptionsUseCase.remove(id);
    await load();
  };

  const seedDefaults = async () => {
    setIsSeeding(true);
    try {
      for (const option of DEFAULT_PET_OPTIONS) {
        await managePetOptionsUseCase.create(option);
      }
      await load();
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    petOptions,
    isLoading,
    isSeeding,
    createPetOption,
    updatePetOption,
    deletePetOption,
    seedDefaults,
    reload: load,
  };
}