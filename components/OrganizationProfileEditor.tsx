import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Heart,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';

interface OrganizationProfileEditorProps {
  profile: any;
  onDataChange: (data: any) => void;
}

const ORG_TYPES = ['NGO', 'Startup', 'SME', 'Corporate', 'Government', 'Social Enterprise', 'School/University'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Finance', 'Manufacturing', 'Agriculture', 'Creative Arts'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const ORG_PACES = ['Fast-paced', 'Structured', 'Community-driven'];

export const OrganizationProfileEditor: React.FC<OrganizationProfileEditorProps> = ({
  profile,
  onDataChange
}) => {
  const [formData, setFormData] = useState({
    org_type: profile?.org_type || '',
    industry_sector: profile?.industry_sector || '',
    year_established: profile?.year_established || new Date().getFullYear(),
    registration_number: profile?.registration_number || '',
    headquarters_location: profile?.headquarters_location || '',
    branch_locations: Array.isArray(profile?.branch_locations) ? profile.branch_locations : [],
    website: profile?.website || '',
    official_email_domain: profile?.official_email_domain || '',
    about_us: profile?.about_us || '',
    mission_statement: profile?.mission_statement || '',
    vision: profile?.vision || '',
    core_values: Array.isArray(profile?.core_values) ? profile.core_values : [],
    employee_count: profile?.employee_count || '',
    countries_of_operation: Array.isArray(profile?.countries_of_operation) ? profile.countries_of_operation : [],
    beneficiaries_served: profile?.beneficiaries_served || '',
    work_culture_description: profile?.work_culture_description || '',
    work_modes: Array.isArray(profile?.work_modes) ? profile.work_modes : [],
    organization_pace: profile?.organization_pace || ''
  });

  const [newBranch, setNewBranch] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const handleTextChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBranch = () => {
    if (newBranch.trim()) {
      setFormData(prev => ({
        ...prev,
        branch_locations: [...prev.branch_locations, newBranch.trim()]
      }));
      setNewBranch('');
    }
  };

  const removeBranch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      branch_locations: prev.branch_locations.filter((_, i) => i !== index)
    }));
  };

  const addValue = () => {
    if (newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        core_values: [...prev.core_values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      core_values: prev.core_values.filter((_, i) => i !== index)
    }));
  };

  const addCountry = () => {
    if (newCountry.trim()) {
      setFormData(prev => ({
        ...prev,
        countries_of_operation: [...prev.countries_of_operation, newCountry.trim()]
      }));
      setNewCountry('');
    }
  };

  const removeCountry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      countries_of_operation: prev.countries_of_operation.filter((_, i) => i !== index)
    }));
  };

  const toggleWorkMode = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      work_modes: prev.work_modes.includes(mode)
        ? prev.work_modes.filter(m => m !== mode)
        : [...prev.work_modes, mode]
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. BASIC ORGANIZATION INFORMATION */}
      <div className="space-y-8">
        <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
          <Briefcase className="w-5 h-5 text-[#facc15]" /> 1. Basic Organization Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Organization Type</label>
            <select
              value={formData.org_type}
              onChange={(e) => handleTextChange('org_type', e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
            >
              <option value="">Select type...</option>
              {ORG_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Industry / Sector</label>
            <select
              value={formData.industry_sector}
              onChange={(e) => handleTextChange('industry_sector', e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
            >
              <option value="">Select sector...</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Year Established</label>
            <input
              type="number"
              value={formData.year_established}
              onChange={(e) => handleTextChange('year_established', parseInt(e.target.value))}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registration Number <span className="text-gray-300">(Optional)</span></label>
            <input
              type="text"
              value={formData.registration_number}
              onChange={(e) => handleTextChange('registration_number', e.target.value)}
              placeholder="e.g., REG-2023-001"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Headquarters Location</label>
            <input
              type="text"
              value={formData.headquarters_location}
              onChange={(e) => handleTextChange('headquarters_location', e.target.value)}
              placeholder="e.g., Nairobi, Kenya"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Official Email Domain</label>
            <input
              type="text"
              value={formData.official_email_domain}
              onChange={(e) => handleTextChange('official_email_domain', e.target.value)}
              placeholder="e.g., company.com"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleTextChange('website', e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Branch Locations */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Branch Locations
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBranch()}
              placeholder="Add a branch location..."
              className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
            <button
              onClick={addBranch}
              className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.branch_locations.map((branch, idx) => (
              <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold text-gray-700">
                {branch}
                <button
                  onClick={() => removeBranch(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ORGANIZATION OVERVIEW */}
      <div className="space-y-8">
        <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
          <Target className="w-5 h-5 text-[#facc15]" /> 2. Organization Overview
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">About Us <span className="text-gray-300">(150-300 words)</span></label>
            <textarea
              value={formData.about_us}
              onChange={(e) => handleTextChange('about_us', e.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Describe your organization, its background, and what makes it unique..."
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
            />
            <p className="text-[9px] text-gray-400 font-bold">{formData.about_us.length}/300</p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mission Statement</label>
            <textarea
              value={formData.mission_statement}
              onChange={(e) => handleTextChange('mission_statement', e.target.value)}
              rows={2}
              placeholder="Our mission is to..."
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vision</label>
            <textarea
              value={formData.vision}
              onChange={(e) => handleTextChange('vision', e.target.value)}
              rows={2}
              placeholder="Our vision is to..."
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
            />
          </div>

          {/* Core Values */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-4 h-4" /> Core Values
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addValue()}
                placeholder="Add a core value..."
                className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
              />
              <button
                onClick={addValue}
                className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.core_values.map((value, idx) => (
                <div key={idx} className="bg-[#facc15]/20 border border-[#facc15] px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold text-black">
                  {value}
                  <button
                    onClick={() => removeValue(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. IMPACT & CULTURE */}
      <div className="space-y-8">
        <h2 className="text-lg font-black text-black uppercase tracking-widest flex items-center gap-3 border-b border-gray-100 pb-4">
          <TrendingUp className="w-5 h-5 text-[#facc15]" /> 3. Impact Statistics & Work Culture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Number of Employees</label>
            <input
              type="text"
              value={formData.employee_count}
              onChange={(e) => handleTextChange('employee_count', e.target.value)}
              placeholder="e.g., 50-100 or 500+"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Beneficiaries Served</label>
            <input
              type="text"
              value={formData.beneficiaries_served}
              onChange={(e) => handleTextChange('beneficiaries_served', e.target.value)}
              placeholder="e.g., 10,000+ students or communities"
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Countries of Operation */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4" /> Countries of Operation
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCountry()}
              placeholder="Add a country..."
              className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-black transition-all"
            />
            <button
              onClick={addCountry}
              className="px-4 py-2 bg-black text-[#facc15] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.countries_of_operation.map((country, idx) => (
              <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold text-gray-700">
                {country}
                <button
                  onClick={() => removeCountry(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Work Culture */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Work Modes
            </label>
            <div className="flex flex-wrap gap-3">
              {WORK_MODES.map(mode => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.work_modes.includes(mode)}
                    onChange={() => toggleWorkMode(mode)}
                    className="w-5 h-5 rounded border-2 border-gray-200 accent-black cursor-pointer"
                  />
                  <span className="text-sm font-bold">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Organization Pace</label>
            <select
              value={formData.organization_pace}
              onChange={(e) => handleTextChange('organization_pace', e.target.value)}
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
            >
              <option value="">Select pace...</option>
              {ORG_PACES.map(pace => (
                <option key={pace} value={pace}>{pace}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Work Culture Description</label>
            <textarea
              value={formData.work_culture_description}
              onChange={(e) => handleTextChange('work_culture_description', e.target.value)}
              rows={3}
              placeholder="Describe your work environment, team dynamics, and company culture..."
              className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-black transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
