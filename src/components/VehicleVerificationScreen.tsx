import React, { useState } from 'react';
import { AuthUser } from '../types';
import { verifyVehicleCredentials, FLEET_VEHICLE_DATABASE, FleetVehicleRecord } from '../auth/vehicleRegistry';
import { ShieldCheck, AlertCircle, ArrowRight, Zap, BatteryCharging, LogOut, CheckCircle2 } from 'lucide-react';

interface VehicleVerificationScreenProps {
  currentUser: AuthUser;
  role: 'donor' | 'receiver';
  onVerified: (verifiedVehicleId: string, vehicleModel?: string) => void;
  onLogout: () => void;
}

export const VehicleVerificationScreen: React.FC<VehicleVerificationScreenProps> = ({
  currentUser,
  role,
  onVerified,
  onLogout,
}) => {
  const isDonor = role === 'donor';
  const roleTitle = isDonor ? 'DONOR' : 'ACCEPTOR';
  const defaultVehicleId = currentUser.vehicleId || (isDonor ? 'EV-007' : 'EV-014');
  const defaultCode = isDonor ? 'QF-007' : 'QF-014';

  const [vehicleId, setVehicleId] = useState(defaultVehicleId);
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<FleetVehicleRecord | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    setTimeout(() => {
      const result = verifyVehicleCredentials(vehicleId, verificationCode, role);

      if (!result.valid || !result.vehicle) {
        setIsVerifying(false);
        setErrorMsg(result.error || 'VEHICLE VERIFICATION FAILED. Vehicle not registered in simulated fleet.');
        return;
      }

      setVerifiedRecord(result.vehicle);
      setIsVerifying(false);

      // Transition into interface after display of verified status
      setTimeout(() => {
        onVerified(result.vehicle!.id, result.vehicle!.model);
      }, 1200);
    }, 600);
  };

  const handleQuickFill = (targetId: string, targetCode: string) => {
    setVehicleId(targetId);
    setVerificationCode(targetCode);
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* Immersive ambient glowing spheres */}
      <div className={`absolute -top-40 -left-40 w-[550px] h-[550px] ${isDonor ? 'bg-emerald-600/15' : 'bg-rose-600/15'} rounded-full blur-[130px] pointer-events-none`} />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono mb-3">
            <span className={`w-2 h-2 rounded-full ${isDonor ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />
            <span className={isDonor ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {roleTitle} VEHICLE VERIFICATION GATEWAY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono uppercase">
            Verify Your Vehicle
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authenticate hardware link to connect with the Q-FLEET real-time grid
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Top subtle highlight border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDonor ? 'from-emerald-500 via-teal-400 to-cyan-500' : 'from-rose-500 via-orange-400 to-pink-500'}`} />

          {/* User Session Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDonor ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-400' : 'bg-rose-950/80 border border-rose-700 text-rose-400'}`}>
                {isDonor ? <Zap className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>
            <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isDonor ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
              ROLE: {roleTitle}
            </div>
          </div>

          {verifiedRecord ? (
            /* Success Feedback State */
            <div className="py-6 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-sm font-mono font-black tracking-wider text-emerald-400 uppercase">
                  VEHICLE VERIFIED ✓
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Onboard telemetry bound successfully. Loading {roleTitle.toLowerCase()} workspace...
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-800/50 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Vehicle Identifier:</span>
                  <span className="font-bold text-white">{verifiedRecord.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-slate-200">{verifiedRecord.model}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Battery Capacity:</span>
                  <span className="text-slate-200">{verifiedRecord.batteryCapacityKwh} kWh</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">State of Charge (SOC):</span>
                  <span className={`font-bold ${verifiedRecord.soc > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verifiedRecord.soc}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charger Verification Code:</span>
                  <span className="text-cyan-400 font-bold">{verifiedRecord.verificationCode}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Verification Input Form */
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  Vehicle ID
                </label>
                <input
                  id="input-verify-vehicle-id"
                  type="text"
                  value={vehicleId}
                  onChange={(e) => {
                    setVehicleId(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder={isDonor ? 'EV-007' : 'EV-014'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono text-white placeholder:text-slate-600 transition-all outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  Simulated fleet vehicle (e.g., {isDonor ? 'EV-007, EV-003, EV-009' : 'EV-014, EV-021, EV-004'})
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1.5">
                  Vehicle / Charger Verification Code
                </label>
                <input
                  id="input-verify-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder={defaultCode}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono tracking-wider text-white placeholder:text-slate-600 transition-all outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  Hardware verification code (Prototype format: QF-XXX matching vehicle, e.g. {defaultCode})
                </span>
              </div>

              {/* Error Message Display */}
              {errorMsg && (
                <div
                  id="verification-error-box"
                  className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 text-xs font-mono space-y-1 animate-shake"
                >
                  <div className="flex items-center gap-1.5 font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>VEHICLE VERIFICATION FAILED</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">{errorMsg}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-verify-vehicle"
                type="submit"
                disabled={isVerifying}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isDonor
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                } ${isVerifying ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>CHECKING SIMULATED FLEET REGISTRY...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY VEHICLE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Quick Fill Testing Assist */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-2 text-center">
                  Quick Prototype Fill (Valid fleet credentials)
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {isDonor ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('EV-007', 'QF-007')}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400 hover:border-emerald-600 transition-all"
                      >
                        EV-007 (QF-007) • 82% SOC
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('EV-003', 'QF-003')}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 hover:border-slate-500 transition-all"
                      >
                        EV-003 (QF-003) • 74% SOC
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('EV-014', 'QF-014')}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-rose-400 hover:border-rose-600 transition-all"
                      >
                        EV-014 (QF-014) • 24% SOC
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('EV-021', 'QF-021')}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 hover:border-slate-500 transition-all"
                      >
                        EV-021 (QF-021) • 18% SOC
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickFill('EV-999', 'WRONG_CODE')}
                    title="Test rejection of invalid credentials"
                    className="px-2 py-1 rounded-lg bg-slate-950/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-[10px] font-mono text-slate-400 hover:text-rose-300 transition-all"
                  >
                    Test Invalid Code
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Logout / Switch Role Option */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono">
              Role: <strong className="text-slate-300">{roleTitle}</strong>
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                id="btn-skip-verification"
                onClick={() => onVerified(defaultVehicleId)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-[11px] hover:underline"
              >
                Skip (Demo) →
              </button>
              <button
                id="btn-verify-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-300 transition-colors font-mono text-[11px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
