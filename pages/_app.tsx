import '../styles/globals.css';
import 'antd/dist/antd.css';
import { AppProps } from 'next/app';
import '../styles/dark-theme.css'


function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return <Component {...pageProps} />;
}

export default MyApp;
