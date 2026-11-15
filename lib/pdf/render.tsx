import { renderToBuffer } from "@react-pdf/renderer";

import { AlbaranDocument } from "./albaran";
import type { AlbaranData } from "./albaran";

export type { AlbaranData };

/** El PDF se renderiza en servidor, sin navegador ni Chrome. */
export async function renderAlbaran(data: AlbaranData): Promise<Buffer> {
  return renderToBuffer(<AlbaranDocument data={data} />);
}
