import '../styles/globals.css';
import { Rubik, Monoton } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-rubik',
  display: 'swap',
});

const monoton = Monoton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-monoton',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${rubik.variable} ${monoton.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
