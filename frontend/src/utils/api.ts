import axios, { AxiosInstance, AxiosError } from 'axios';

const getBaseURL = () => {
  // Use the global __API_URL__ if injected by Vite, 
  // otherwise default to the production API
  const base = (typeof __API_URL__ !== 'undefined' && __API_URL__)
    ? __API_URL__.replace(/\/$/, '')
    : 'https://api.miisky.com';

  return base.endsWith('/api') ? base : `${base}/api`;
};

const API: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000, // Increased to 20s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// COMPANY INFO
// ============================================================================
export const getCompanyInfo = () => API.get('/website/companyinfo/');
export const createCompanyInfo = (data: any) => API.post('/website/companyinfo/', data);
export const updateCompanyInfo = (id: number | string, data: any) => API.put(`/website/companyinfo/${id}/`, data);
export const deleteCompanyInfo = (id: number | string) => API.delete(`/website/companyinfo/${id}/`);

// ============================================================================
// HERO BANNER
// ============================================================================
export const getHeroBanners = () => API.get('/website/herobanner/');
export const getHeroBannerById = (id: number | string) => API.get(`/website/herobanner/${id}/`);
export const createHeroBanner = (data: any) => API.post('/website/herobanner/', data);
export const updateHeroBanner = (id: number | string, data: any) => API.put(`/website/herobanner/${id}/`, data);
export const deleteHeroBanner = (id: number | string) => API.delete(`/website/herobanner/${id}/`);

// ============================================================================
// MEDICAL DEVICE CATEGORIES
// ============================================================================
export const getMedicalDeviceCategories = () => API.get('/website/medicaldevicecategory/');
export const getMedicalDeviceCategoryById = (id: number | string) => API.get(`/website/medicaldevicecategory/${id}/`);
export const createMedicalDeviceCategory = (data: any) => API.post('/website/medicaldevicecategory/', data);
export const updateMedicalDeviceCategory = (id: number | string, data: any) => API.put(`/website/medicaldevicecategory/${id}/`, data);
export const deleteMedicalDeviceCategory = (id: number | string) => API.delete(`/website/medicaldevicecategory/${id}/`);

// ============================================================================
// MEDICAL DEVICES
// ============================================================================
export const getMedicalDevices = () => API.get('/website/medicaldevice/');
export const getMedicalDeviceById = (id: number | string) => API.get(`/website/medicaldevice/${id}/`);
export const createMedicalDevice = (data: any) => API.post('/website/medicaldevice/', data);
export const updateMedicalDevice = (id: number | string, data: any) => API.put(`/website/medicaldevice/${id}/`, data);
export const deleteMedicalDevice = (id: number | string) => API.delete(`/website/medicaldevice/${id}/`);

// ============================================================================
// DEVICE FEATURES
// ============================================================================
export const getDeviceFeatures = (deviceId?: number | string) => {
  const url = deviceId ? `/website/devicefeature/?device=${deviceId}` : '/website/devicefeature/';
  return API.get(url);
};
export const getDeviceFeatureById = (id: number | string) => API.get(`/website/devicefeature/${id}/`);
export const createDeviceFeature = (data: any) => API.post('/website/devicefeature/', data);
export const updateDeviceFeature = (id: number | string, data: any) => API.put(`/website/devicefeature/${id}/`, data);
export const deleteDeviceFeature = (id: number | string) => API.delete(`/website/devicefeature/${id}/`);

// ============================================================================
// RESEARCH PAPERS
// ============================================================================
export const getResearchPapers = () => API.get('/website/researchpaper/');
export const getResearchPaperById = (id: number | string) => API.get(`/website/researchpaper/${id}/`);
export const createResearchPaper = (data: any) => API.post('/website/researchpaper/', data);
export const updateResearchPaper = (id: number | string, data: any) => API.put(`/website/researchpaper/${id}/`, data);
export const deleteResearchPaper = (id: number | string) => API.delete(`/website/researchpaper/${id}/`);

// ============================================================================
// BLOG CATEGORIES
// ============================================================================
export const getBlogCategories = () => API.get('/website/blogcategory/');
export const getBlogCategoryById = (id: number | string) => API.get(`/website/blogcategory/${id}/`);
export const createBlogCategory = (data: any) => API.post('/website/blogcategory/', data);
export const updateBlogCategory = (id: number | string, data: any) => API.put(`/website/blogcategory/${id}/`, data);
export const deleteBlogCategory = (id: number | string) => API.delete(`/website/blogcategory/${id}/`);

// ============================================================================
// BLOG TAGS
// ============================================================================
export const getBlogTags = () => API.get('/website/blogtag/');
export const getBlogTagById = (id: number | string) => API.get(`/website/blogtag/${id}/`);
export const createBlogTag = (data: any) => API.post('/website/blogtag/', data);
export const updateBlogTag = (id: number | string, data: any) => API.put(`/website/blogtag/${id}/`, data);
export const deleteBlogTag = (id: number | string) => API.delete(`/website/blogtag/${id}/`);

// ============================================================================
// BLOG POSTS
// ============================================================================
export const getBlogPosts = (params: any = {}) => API.get('/website/blogpost/', { params });
export const getBlogPostById = (id: number | string) => API.get(`/website/blogpost/${id}/`);
export const createBlogPost = (data: any) => API.post('/website/blogpost/', data);
export const updateBlogPost = (id: number | string, data: any) => API.put(`/website/blogpost/${id}/`, data);
export const deleteBlogPost = (id: number | string) => API.delete(`/website/blogpost/${id}/`);
export const likeBlogPost = (uid: string) => API.post(`/website/blogpost/${uid}/like/`);
export const unlikeBlogPost = (uid: string) => API.post(`/website/blogpost/${uid}/unlike/`);

// ============================================================================
// BLOG COMMENTS
// ============================================================================
export const getBlogComments = (postId?: number) => {
  const url = postId ? `/website/blogcomment/?blog_post=${postId}` : '/website/blogcomment/';
  return API.get(url);
};
export const getBlogCommentById = (id: number | string) => API.get(`/website/blogcomment/${id}/`);
export const createBlogComment = (data: any) => API.post('/website/blogcomment/', data);
export const updateBlogComment = (id: number | string, data: any) => API.put(`/website/blogcomment/${id}/`, data);
export const deleteBlogComment = (id: number | string) => API.delete(`/website/blogcomment/${id}/`);

// ============================================================================
// REPORT TYPES
// ============================================================================
export const getReportTypes = () => API.get('/website/reporttype/');
export const getReportTypeById = (id: number | string) => API.get(`/website/reporttype/${id}/`);
export const createReportType = (data: any) => API.post('/website/reporttype/', data);
export const updateReportType = (id: number | string, data: any) => API.put(`/website/reporttype/${id}/`, data);
export const deleteReportType = (id: number | string) => API.delete(`/website/reporttype/${id}/`);

// ============================================================================
// WEBSITE REPORTS
// ============================================================================
export const getWebsiteReports = () => API.get('/website/websitereport/');
export const getWebsiteReportById = (id: number | string) => API.get(`/website/websitereport/${id}/`);
export const createWebsiteReport = (data: any) => API.post('/website/websitereport/', data);
export const updateWebsiteReport = (id: number | string, data: any) => API.put(`/website/websitereport/${id}/`, data);
export const deleteWebsiteReport = (id: number | string) => API.delete(`/website/websitereport/${id}/`);

// ============================================================================
// TESTIMONIALS
// ============================================================================
export const getTestimonials = () => API.get('/website/testimonial/');
export const getTestimonialById = (id: number | string) => API.get(`/website/testimonial/${id}/`);
export const createTestimonial = (data: any) => API.post('/website/testimonial/', data);
export const updateTestimonial = (id: number | string, data: any) => API.put(`/website/testimonial/${id}/`, data);
export const deleteTestimonial = (id: number | string) => API.delete(`/website/testimonial/${id}/`);

// ============================================================================
// FAQ CATEGORIES
// ============================================================================
export const getFAQCategories = (params: any = {}) => API.get('/website/faqcategory/', { params });
export const getFAQCategoryById = (id: number | string) => API.get(`/website/faqcategory/${id}/`);
export const createFAQCategory = (data: any) => API.post('/website/faqcategory/', data);
export const updateFAQCategory = (id: number | string, data: any) => API.put(`/website/faqcategory/${id}/`, data);
export const deleteFAQCategory = (id: number | string) => API.delete(`/website/faqcategory/${id}/`);

// ============================================================================
// FAQs
// ============================================================================
export const getFAQs = (params: any = {}) => API.get('/website/faq/', { params });
export const getFAQById = (id: number | string) => API.get(`/website/faq/${id}/`);
export const createFAQ = (data: any) => API.post('/website/faq/', data);
export const updateFAQ = (id: number | string, data: any) => API.put(`/website/faq/${id}/`, data);
export const deleteFAQ = (id: number | string) => API.delete(`/website/faq/${id}/`);

// ============================================================================
// DEPARTMENTS
// ============================================================================
export const getDepartments = () => API.get('/website/department/');
export const getDepartmentById = (id: number | string) => API.get(`/website/department/${id}/`);
export const createDepartment = (data: any) => API.post('/website/department/', data);
export const updateDepartment = (id: number | string, data: any) => API.put(`/website/department/${id}/`, data);
export const deleteDepartment = (id: number | string) => API.delete(`/website/department/${id}/`);

// ============================================================================
// TEAM MEMBERS
// ============================================================================
export const getTeamMembers = () => API.get('/website/teammember/');
export const getTeamMemberById = (id: number | string) => API.get(`/website/teammember/${id}/`);
export const createTeamMember = (data: any) => API.post('/website/teammember/', data);
export const updateTeamMember = (id: number | string, data: any) => API.put(`/website/teammember/${id}/`, data);
export const deleteTeamMember = (id: number | string) => API.delete(`/website/teammember/${id}/`);

// ============================================================================
// JOB LISTINGS
// ============================================================================
export const getJobListings = (params: any = {}) => API.get('/website/joblisting/', { params });
export const getJobListingById = (id: number | string) => API.get(`/website/joblisting/${id}/`);
export const createJobListing = (data: any) => API.post('/website/joblisting/', data);
export const updateJobListing = (id: number | string, data: any) => API.put(`/website/joblisting/${id}/`, data);
export const deleteJobListing = (id: number | string) => API.delete(`/website/joblisting/${id}/`);

// ============================================================================
// JOB APPLICATIONS
// ============================================================================
export const getJobApplications = () => API.get('/website/jobapplication/');
export const getJobApplicationById = (id: number | string) => API.get(`/website/jobapplication/${id}/`);
export const createJobApplication = (data: any) => API.post('/website/jobapplication/', data);
export const updateJobApplication = (id: number | string, data: any) => API.put(`/website/jobapplication/${id}/`, data);
export const deleteJobApplication = (id: number | string) => API.delete(`/website/jobapplication/${id}/`);

// ============================================================================
// GALLERY CATEGORIES
// ============================================================================
export const getGalleryCategories = () => API.get('/website/gallerycategory/');
export const getGalleryCategoryById = (id: number | string) => API.get(`/website/gallerycategory/${id}/`);
export const createGalleryCategory = (data: any) => API.post('/website/gallerycategory/', data);
export const updateGalleryCategory = (id: number | string, data: any) => API.put(`/website/gallerycategory/${id}/`, data);
export const deleteGalleryCategory = (id: number | string) => API.delete(`/website/gallerycategory/${id}/`);

// ============================================================================
// GALLERY ITEMS
// ============================================================================
export const getGalleryItems = (params: any = {}) => API.get('/website/galleryitem/', { params });
export const getGalleryItemById = (id: number | string) => API.get(`/website/galleryitem/${id}/`);
export const createGalleryItem = (data: any) => API.post('/website/galleryitem/', data);
export const updateGalleryItem = (id: number | string, data: any) => API.put(`/website/galleryitem/${id}/`, data);
export const deleteGalleryItem = (id: number | string) => API.delete(`/website/galleryitem/${id}/`);

// ============================================================================
// PARTNERS
// ============================================================================
export const getPartners = () => API.get('/website/partner/');
export const getPartnerById = (id: number | string) => API.get(`/website/partner/${id}/`);
export const createPartner = (data: any) => API.post('/website/partner/', data);
export const updatePartner = (id: number | string, data: any) => API.put(`/website/partner/${id}/`, data);
export const deletePartner = (id: number | string) => API.delete(`/website/partner/${id}/`);

// ============================================================================
// COMPANY ABOUT SECTIONS
// ============================================================================
export const getCompanyAboutSections = () => API.get('/website/companyaboutsection/');
export const getAboutSections = () => API.get('/website/companyaboutsection/', { params: { is_active: true } });
export const getCompanyAboutSectionById = (id: number | string) => API.get(`/website/companyaboutsection/${id}/`);
export const createCompanyAboutSection = (data: any) => API.post('/website/companyaboutsection/', data);
export const updateCompanyAboutSection = (id: number | string, data: any) => API.put(`/website/companyaboutsection/${id}/`, data);
export const deleteCompanyAboutSection = (id: number | string) => API.delete(`/website/companyaboutsection/${id}/`);

// ============================================================================
// LEGAL PAGES
// ============================================================================
export const getLegalPages = () => API.get('/website/legalpage/');
export const getLegalPageById = (id: number | string) => API.get(`/website/legalpage/${id}/`);
export const createLegalPage = (data: any) => API.post('/website/legalpage/', data);
export const updateLegalPage = (id: number | string, data: any) => API.put(`/website/legalpage/${id}/`, data);
export const deleteLegalPage = (id: number | string) => API.delete(`/website/legalpage/${id}/`);

// ============================================================================
// PATENTS
// ============================================================================
export const getPatents = () => API.get('/website/patent/');
export const getPatentById = (id: number | string) => API.get(`/website/patent/${id}/`);
export const createPatent = (data: any) => API.post('/website/patent/', data);
export const updatePatent = (id: number | string, data: any) => API.put(`/website/patent/${id}/`, data);
export const deletePatent = (id: number | string) => API.delete(`/website/patent/${id}/`);

// ============================================================================
// WORKFLOW STEPS
// ============================================================================
export const getWorkflowSteps = () => API.get('/website/workflowstep/');
export const getWorkflowStepById = (id: number | string) => API.get(`/website/workflowstep/${id}/`);
export const createWorkflowStep = (data: any) => API.post('/website/workflowstep/', data);
export const updateWorkflowStep = (id: number | string, data: any) => API.put(`/website/workflowstep/${id}/`, data);
export const deleteWorkflowStep = (id: number | string) => API.delete(`/website/workflowstep/${id}/`);

// ============================================================================
// PRICING PLANS
// ============================================================================
export const getPricingPlans = () => API.get('/website/pricingplan/');
export const getPricingPlanById = (id: number | string) => API.get(`/website/pricingplan/${id}/`);
export const createPricingPlan = (data: any) => API.post('/website/pricingplan/', data);
export const updatePricingPlan = (id: number | string, data: any) => API.put(`/website/pricingplan/${id}/`, data);
export const deletePricingPlan = (id: number | string) => API.delete(`/website/pricingplan/${id}/`);

// ============================================================================
// DIET PLANS
// ============================================================================
export const getDietPlans = (params: any = {}) => API.get('/dietplan/', { params });
export const getAllDietPlans = () => API.get('/dietplan/all/');
export const getDietPlanById = (id: number | string) => API.get(`/dietplan/${id}/`);
export const createDietPlan = (data: any) => API.post('/dietplan/', data);
export const updateDietPlan = (id: number | string, data: any) => API.put(`/dietplan/${id}/`, data);
export const deleteDietPlan = (id: number | string) => API.delete(`/dietplan/${id}/`);

// ============================================================================
// DIET PLAN FEATURES
// ============================================================================
export const getDietPlanFeatures = (params: any = {}) => API.get('/dietplanfeature/', { params });
export const createDietPlanFeature = (data: any) => API.post('/dietplanfeature/', data);
export const updateDietPlanFeature = (id: number | string, data: any) => API.put(`/dietplanfeature/${id}/`, data);
export const deleteDietPlanFeature = (id: number | string) => API.delete(`/dietplanfeature/${id}/`);

// ============================================================================
// WEBSITE INQUIRIES
// ============================================================================
export const getWebsiteInquiries = (params: any = {}) => API.get('/website/websiteinquiry/', { params });
export const getWebsiteInquiryById = (id: number | string) => API.get(`/website/websiteinquiry/${id}/`);
export const createWebsiteInquiry = (data: any) => API.post('/website/websiteinquiry/', data);
export const updateWebsiteInquiry = (id: number | string, data: any) => API.put(`/website/websiteinquiry/${id}/`, data);
export const deleteWebsiteInquiry = (id: number | string) => API.delete(`/website/websiteinquiry/${id}/`);

// ============================================================================
// DASHBOARD STATS
// ============================================================================
export const getDashboardStats = () => API.get('/website/dashboard-stats/');

// ============================================================================
// APPOINTMENTS (Custom endpoint)
// ============================================================================
export const createAppointment = (data: any) => API.post('/appointments/', data);
export const getAppointments = () => API.get('/appointments/');

// Backward compatibility
export const appointmentApi = {
  create: createAppointment,
  getAll: getAppointments,
};

export default API;
