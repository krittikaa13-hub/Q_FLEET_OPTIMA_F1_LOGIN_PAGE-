import React from 'react';
import { AuthUser, UserRole } from './types';

export interface DpProps {
  initialRole?: UserRole;
  activeRole?: UserRole;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export declare const Dp: React.FC<DpProps>;
export declare const Pt: any;
export declare const wp: React.FC<any>;
export declare const Ep: React.FC<any>;
export declare const jp: React.FC<any>;
export declare const zp: React.FC<any>;
export declare const Lp: React.FC<any>;
export declare const Mp: React.FC<any>;
export declare const Op: React.FC<any>;
