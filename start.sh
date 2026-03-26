#!/bin/bash
cd ~/smart-store-app

# config.ts 생성 (없을 때만)
if [ ! -f src/lib/config.ts ]; then
cat > src/lib/config.ts << 'EOF'
import { homedir } from "os";
import { join } from "path";

export const NAVER_CLIENT_ID = "7XLvcRt2WPui7z6h1ocsnq";
export const NAVER_CLIENT_SECRET = "$2a$04$VaXM3RzVwHMG7VuOdIwhsu";
export const IMAGE_BASE_DIR = join(homedir(), "storage/pictures/도안");
EOF
echo "config.ts 생성 완료"
fi

# 도안 폴더 생성
mkdir -p ~/storage/pictures/도안

# 서버 실행
npx next dev --webpack
