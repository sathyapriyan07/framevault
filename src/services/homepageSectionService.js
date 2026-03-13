import { supabase } from './supabaseClient'

export const homepageSectionService = {
  async getActiveSections() {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    return { data, error }
  },

  async getAllSections() {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true })
    return { data, error }
  },

  async createSection(sectionData) {
    const { data, error } = await supabase
      .from('homepage_sections')
      .insert([sectionData])
      .select()
    return { data, error }
  },

  async updateSection(id, sectionData) {
    const { data, error } = await supabase
      .from('homepage_sections')
      .update(sectionData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteSection(id) {
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id)
    return { error }
  },

  async toggleSection(id, isActive) {
    const { data, error } = await supabase
      .from('homepage_sections')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    return { data, error }
  }
}
