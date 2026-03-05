export interface LinkItemInterface {
  id: string;
  title: string;
  items: {
    id: number;
    title: string;
    url: string;
  }[];
  onclick?: () => void;
}
