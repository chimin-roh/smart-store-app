#!/bin/bash
cd ~/smart-store-app

# config.ts 생성 (없을 때만)
if [ ! -f src/lib/config.ts ]; then
cat > src/lib/config.ts << 'EOF'
export const NAVER_CLIENT_ID = "7XLvcRt2WPui7z6h1ocsnq";
export const NAVER_CLIENT_SECRET = "$2a$04$VaXM3RzVwHMG7VuOdIwhsu";
EOF
echo "config.ts 생성 완료"
fi

# 서버 실행
npx next dev --webpack
