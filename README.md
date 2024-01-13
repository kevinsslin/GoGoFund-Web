This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, our api key is only for demo test, so we provide in .env.example for quickly setting up.

1. install by pnpm

2. run the docker and migrate

3. use pnpm run dev to start

Other,

```bash
copy .env.example to .env

pnpm i

docker compose up -d

pnpm migrate

pnpm run dev
```

All Events Page:

查看所有發布的 events

點擊 event card 可以看到更詳細活動的資訊

在單個 event 頁面可以投資該活動( 錢包需有錢 )

My Events Page:

點擊右上 get fund 可以創建募資活動

之後須至 my event 中編輯並發行 nft 商品，該活動才會出現至 All events page

在單個 event 的 page 中可以編輯標題、敘述、金額等等

My Collection:

可以查看所有參與的項目

點擊該 card 可以查看購買過的商品

左側也可以編輯個人資料

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

團隊分工
b09901063 鄭鈞元 : 後端建置、api撰寫
b10303046 林柏呈 : 區塊鏈合約撰寫、串接至前端
b10303029 黃榆婷 : 前端頁面設計、實作前端
