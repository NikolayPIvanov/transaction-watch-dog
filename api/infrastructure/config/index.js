import dotenv from 'dotenv';
import path from 'path';
import url from 'url';

const configure = () => {
  const dirname = url.fileURLToPath(new URL('.', import.meta.url));

  dotenv.config({ path: path.join(dirname, '..', '..', '.env') });
};

export default configure;
