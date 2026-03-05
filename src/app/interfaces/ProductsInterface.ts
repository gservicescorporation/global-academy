export interface ProductsInterface {
  id: number;
  title: string;
  debate?: string;
  images?: string[];
  status?: string;
  understanding?: string;
  focus?: string;
  exhibition?: string;
  revaluation?: string;
  time?: string;
  typeDuration?: string;
  description: string;
  modality: string;
  certificate: string;
  locale: string;
  startDate: string;
  language: string;
  country: string;
  workload: string;
  coverImg: string;
  teaching?: {
    id: number;
    imgUrl: string;
    name: string;
    description: string;
  }[];
  recipients?: string;
  candidacy?: string;
  modules?: string[];
  certificateImgUrls?: string[];
}
