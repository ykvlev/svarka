import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Кантователь для райдера — 19 000 ₽ | Великий Новгород",description:"Кантователи для райдеров и садовых мини-тракторов. Порошковая окраска, индивидуальные размеры, доставка СДЭК включена в цену.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru"><body>{children}</body></html>}

