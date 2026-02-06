import type { QMContext } from "../schemas/index.ts";

export interface QMProvider {
  pickCategoryAndTitle(context: QMContext): Promise<{ category: string; title: string }>;
}
