import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Кантователь для райдера — 15 000 ₽ | Великий Новгород",description:"Кантователи для райдеров и садовых мини-тракторов. Порошковая окраска, индивидуальные размеры, отправка СДЭК.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru"><body>{children}</body></html>}
