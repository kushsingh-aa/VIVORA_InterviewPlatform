import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SkillContext = createContext(null);

const API = (path) => `/skill${path}`;
const OPP_API = (path) => `/opportunity${path}`;
const ANA_API = (path) => `/analytics${path}`;

export function SkillProvider({ children }) {
  const { token } = useAuth();

  const [skillPassport, setSkillPassport] = useState(null);
  const [passportLoading, setPassportLoading] = useState(false);

  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('fullstack-developer');

  const [opportunities, setOpportunities] = useState([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());

  const [cohortData, setCohortData] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(false);

  const [demandData, setDemandData] = useState([]);

  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  const fetchSkillPassport = useCallback(async () => {
    if (!token) return;
    setPassportLoading(true);
    try {
      const res = await fetch(API('/passport'), { headers: authHeader() });
      const data = await res.json();
      if (data.success) setSkillPassport(data.profile);
    } catch (e) {
      console.error('fetchSkillPassport error:', e);
    } finally {
      setPassportLoading(false);
    }
  }, [token]);

  const fetchGap = useCallback(async (roleSlug) => {
    if (!token) return;
    const slug = roleSlug || selectedRole;
    setGapLoading(true);
    try {
      const res = await fetch(API(`/gap?roleSlug=${slug}`), { headers: authHeader() });
      const data = await res.json();
      if (data.success) { setGapData(data); setSelectedRole(slug); }
    } catch (e) {
      console.error('fetchGap error:', e);
    } finally {
      setGapLoading(false);
    }
  }, [token, selectedRole]);

  const updateSkillPassport = useCallback(async (skills) => {
    if (!token) return;
    try {
      const res = await fetch(API('/passport'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ skills })
      });
      const data = await res.json();
      if (data.success) setSkillPassport(data.profile);
      return data;
    } catch (e) {
      console.error('updateSkillPassport error:', e);
    }
  }, [token]);

  const fetchOpportunities = useCallback(async (filters = {}) => {
    if (!token) return;
    setOppLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(OPP_API(`/?${params}`), { headers: authHeader() });
      const data = await res.json();
      if (data.success) setOpportunities(data.opportunities);
    } catch (e) {
      console.error('fetchOpportunities error:', e);
    } finally {
      setOppLoading(false);
    }
  }, [token]);

  const applyToOpportunity = useCallback(async (id, coverNote = '') => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(OPP_API(`/${id}/apply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ coverNote })
      });
      const data = await res.json();
      if (data.success) setAppliedIds(prev => new Set([...prev, id]));
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  }, [token]);

  const fetchCohortData = useCallback(async () => {
    if (!token) return;
    setCohortLoading(true);
    try {
      const res = await fetch(ANA_API('/cohort'), { headers: authHeader() });
      const data = await res.json();
      if (data.success) setCohortData(data.data);
    } catch (e) {
      console.error('fetchCohortData error:', e);
    } finally {
      setCohortLoading(false);
    }
  }, [token]);

  const fetchDemand = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(ANA_API('/demand'), { headers: authHeader() });
      const data = await res.json();
      if (data.success) setDemandData(data.demand);
    } catch (e) {
      console.error('fetchDemand error:', e);
    }
  }, [token]);

  const value = {
    skillPassport, passportLoading, fetchSkillPassport, updateSkillPassport,
    gapData, gapLoading, selectedRole, setSelectedRole, fetchGap,
    opportunities, oppLoading, appliedIds, fetchOpportunities, applyToOpportunity,
    cohortData, cohortLoading, fetchCohortData,
    demandData, fetchDemand
  };

  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>;
}

export const useSkill = () => {
  const ctx = useContext(SkillContext);
  if (!ctx) throw new Error('useSkill must be used within <SkillProvider>');
  return ctx;
};
