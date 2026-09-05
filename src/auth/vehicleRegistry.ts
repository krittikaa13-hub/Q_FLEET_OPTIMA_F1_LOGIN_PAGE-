/**
 * Q-FLEET Vehicle Verification Registry
 * Binds vehicles in the simulated fleet to their hardware verification credentials.
 * Prototype records match: EV-XXX -> QF-XXX (e.g., EV-007 -> QF-007, EV-014 -> QF-014)
 */

export interface FleetVehicleRecord {
  id: string;
  verificationCode: string;
  model: string;
  batteryCapacityKwh: number;
  soc: number;
  role: 'donor' | 'receiver' | 'neutral';
  availableEnergyKwh?: number;
  energyDemandKwh?: number;
  commQuality: string;
  status: string;
}

export const FLEET_VEHICLE_DATABASE: FleetVehicleRecord[] = [
  {
    id: 'EV-014',
    verificationCode: 'QF-014',
    model: 'Hyundai Ioniq 5 AWD',
    batteryCapacityKwh: 60,
    soc: 24,
    role: 'receiver',
    energyDemandKwh: 18,
    commQuality: 'Excellent',
    status: 'receiver_needed',
  },
  {
    id: 'EV-007',
    verificationCode: 'QF-007',
    model: 'Tesla Model Y Long Range',
    batteryCapacityKwh: 75,
    soc: 82,
    role: 'donor',
    availableEnergyKwh: 20,
    commQuality: 'Excellent',
    status: 'donor_available',
  },
  {
    id: 'EV-003',
    verificationCode: 'QF-003',
    model: 'Ford Mustang Mach-E',
    batteryCapacityKwh: 68,
    soc: 74,
    role: 'donor',
    availableEnergyKwh: 12,
    commQuality: 'Good',
    status: 'donor_available',
  },
  {
    id: 'EV-019',
    verificationCode: 'QF-019',
    model: 'Chevrolet Bolt EV',
    batteryCapacityKwh: 65,
    soc: 68,
    role: 'donor',
    availableEnergyKwh: 8,
    commQuality: 'Weak',
    status: 'donor_available',
  },
  {
    id: 'EV-021',
    verificationCode: 'QF-021',
    model: 'Nissan Ariya e-4ORCE',
    batteryCapacityKwh: 87,
    soc: 18,
    role: 'receiver',
    energyDemandKwh: 35,
    commQuality: 'Good',
    status: 'receiver_needed',
  },
  {
    id: 'EV-004',
    verificationCode: 'QF-004',
    model: 'Kia EV6 GT-Line',
    batteryCapacityKwh: 77.4,
    soc: 28,
    role: 'receiver',
    energyDemandKwh: 22,
    commQuality: 'Excellent',
    status: 'receiver_needed',
  },
  {
    id: 'EV-011',
    verificationCode: 'QF-011',
    model: 'Volkswagen ID.4 Pro',
    batteryCapacityKwh: 82,
    soc: 55,
    role: 'donor',
    availableEnergyKwh: 6,
    commQuality: 'Weak',
    status: 'donor_available',
  },
  {
    id: 'EV-009',
    verificationCode: 'QF-009',
    model: 'Tesla Model 3 Performance',
    batteryCapacityKwh: 82,
    soc: 88,
    role: 'donor',
    availableEnergyKwh: 25,
    commQuality: 'Excellent',
    status: 'donor_available',
  },
  {
    id: 'EV-001',
    verificationCode: 'QF-001',
    model: 'Porsche Taycan 4S',
    batteryCapacityKwh: 93.4,
    soc: 78,
    role: 'donor',
    availableEnergyKwh: 22,
    commQuality: 'Excellent',
    status: 'donor_available',
  },
  {
    id: 'EV-002',
    verificationCode: 'QF-002',
    model: 'Polestar 2 Dual Motor',
    batteryCapacityKwh: 78,
    soc: 65,
    role: 'donor',
    availableEnergyKwh: 14,
    commQuality: 'Good',
    status: 'donor_available',
  },
  {
    id: 'EV-005',
    verificationCode: 'QF-005',
    model: 'Audi e-tron GT',
    batteryCapacityKwh: 93.4,
    soc: 58,
    role: 'neutral',
    commQuality: 'Good',
    status: 'neutral',
  },
  {
    id: 'EV-006',
    verificationCode: 'QF-006',
    model: 'BMW i4 M50',
    batteryCapacityKwh: 83.9,
    soc: 50,
    role: 'neutral',
    commQuality: 'Good',
    status: 'neutral',
  },
];

export interface VerificationValidationResult {
  valid: boolean;
  error?: string;
  vehicle?: FleetVehicleRecord;
}

/**
 * Validates a vehicle ID and charger hardware verification code against the simulated fleet database.
 * Enforces role-specific energy constraints (e.g. donors must have adequate energy; acceptors must require energy).
 */
export function verifyVehicleCredentials(
  vehicleIdInput: string,
  verificationCodeInput: string,
  userRole: 'donor' | 'receiver'
): VerificationValidationResult {
  const cleanId = vehicleIdInput.trim().toUpperCase();
  const cleanCode = verificationCodeInput.trim().toUpperCase();

  if (!cleanId) {
    return { valid: false, error: 'Vehicle ID is required.' };
  }

  if (!cleanCode) {
    return { valid: false, error: 'Vehicle / charger verification code is required.' };
  }

  // 1. Check if vehicle exists in fleet database
  const record = FLEET_VEHICLE_DATABASE.find(
    (v) => v.id.toUpperCase() === cleanId
  );

  // If not in static list, check dynamic standard (EV-XXX -> QF-XXX)
  const expectedCode = cleanId.replace('EV-', 'QF-');

  if (!record && !cleanId.startsWith('EV-')) {
    return {
      valid: false,
      error: `Vehicle "${cleanId}" not found in Q-FLEET active grid registry. Only registered fleet EVs can be verified.`,
    };
  }

  // 2. Validate verification code against vehicle
  const targetCode = record ? record.verificationCode : expectedCode;
  if (cleanCode !== targetCode) {
    return {
      valid: false,
      error: `VEHICLE VERIFICATION FAILED: Verification code "${cleanCode}" does not match the onboard charger hardware code for ${cleanId}. (Expected format: QF-XXX)`,
    };
  }

  // 3. Enforce Role Compatibility
  if (record) {
    if (userRole === 'donor') {
      if (record.role === 'receiver' || record.soc < 40) {
        return {
          valid: false,
          error: `VEHICLE VERIFICATION FAILED: ${record.id} (${record.model}) has low battery (${record.soc}% SOC) and is registered as an energy Acceptor, not an Energy Donor.`,
        };
      }
    } else if (userRole === 'receiver') {
      if (record.role === 'donor' && record.soc > 60) {
        return {
          valid: false,
          error: `VEHICLE VERIFICATION FAILED: ${record.id} (${record.model}) has ${record.soc}% SOC and is currently registered as a high-capacity Energy Donor.`,
        };
      }
    }
  }

  const verifiedRecord: FleetVehicleRecord = record || {
    id: cleanId,
    verificationCode: targetCode,
    model: 'Standard Fleet EV',
    batteryCapacityKwh: 75,
    soc: userRole === 'donor' ? 82 : 24,
    role: userRole,
    availableEnergyKwh: userRole === 'donor' ? 20 : 0,
    energyDemandKwh: userRole === 'receiver' ? 18 : 0,
    commQuality: 'Excellent',
    status: userRole === 'donor' ? 'donor_available' : 'receiver_needed',
  };

  return {
    valid: true,
    vehicle: verifiedRecord,
  };
}
