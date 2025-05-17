// Map of supplement form types to their image URLs
export const supplementFormImages = {
  softgel: 'https://images.pexels.com/photos/139655/pexels-photo-139655.jpeg?auto=compress&cs=tinysrgb&w=800',
  capsule_solid: 'https://images.pexels.com/photos/143654/pexels-photo-143654.jpeg?auto=compress&cs=tinysrgb&w=800',
  capsule_powder: 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=800',
  powder_large: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg?auto=compress&cs=tinysrgb&w=800',
  powder_fine: 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg?auto=compress&cs=tinysrgb&w=800',
  liquid_bottle: 'https://images.pexels.com/photos/4004613/pexels-photo-4004613.jpeg?auto=compress&cs=tinysrgb&w=800',
  gummy: 'https://images.pexels.com/photos/4004614/pexels-photo-4004614.jpeg?auto=compress&cs=tinysrgb&w=800',
  stick_pack: 'https://images.pexels.com/photos/4004615/pexels-photo-4004615.jpeg?auto=compress&cs=tinysrgb&w=800',
  effervescent: 'https://images.pexels.com/photos/4004616/pexels-photo-4004616.jpeg?auto=compress&cs=tinysrgb&w=800',
  default: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
};

// Get image URL for a supplement form type
export const getSupplementFormImage = (formType: string | undefined): string => {
  if (!formType || !supplementFormImages[formType as keyof typeof supplementFormImages]) {
    return supplementFormImages.default;
  }
  return supplementFormImages[formType as keyof typeof supplementFormImages];
};

// Map of supplement form types to their descriptions
export const supplementFormDescriptions = {
  softgel: 'Soft gelatin capsule containing liquid or oil-based supplements',
  capsule_solid: 'Hard capsule containing solid supplement material',
  capsule_powder: 'Hard capsule containing powdered supplement material',
  powder_large: 'Bulk powder supplement, typically for protein or meal replacements',
  powder_fine: 'Fine powder supplement, typically for mixing with liquids',
  liquid_bottle: 'Liquid supplement in dropper bottle',
  gummy: 'Chewable gummy supplement',
  stick_pack: 'Individual powder packets for single-serving use',
  effervescent: 'Tablet that dissolves in water with effervescent action'
};

// Get description for a supplement form type
export const getSupplementFormDescription = (formType: string | undefined): string => {
  if (!formType || !supplementFormDescriptions[formType as keyof typeof supplementFormDescriptions]) {
    return 'Standard supplement form';
  }
  return supplementFormDescriptions[formType as keyof typeof supplementFormDescriptions];
};