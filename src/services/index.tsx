import { request } from '../utils';

const urls = {
  fetchModules: '/document/component/getComponentInfoByBizLabel',

  fetchTemplateDetail: '/document/template/detailById',
  saveTemplateDetail: '/document/template/updateTemplateContent',

  // fetchDoumentDetail: '/document/template/detailById',
  // saveDocumentDetail: '/document/template/updateTemplateContent',
};

export const modulesService = {
  query: (params: { temTypeList: string[] }) => request(urls.fetchModules, params, 'json'),
};

export const templateDetailService = {
  save: (params: { templateId: string; detail: {} }) => request(urls.saveTemplateDetail, params, 'json'),
  query: (params: { templateId: string }) => request(urls.fetchTemplateDetail, params, 'json'),
};

// export const fetchDocumentDetail = (params: { docId: string }) => request(urls.fetchDoumentDetail, params, 'json');
// export const saveDocumentDetail = (params: { docId: string }) => request(urls.saveDocumentDetail, params, 'json');
