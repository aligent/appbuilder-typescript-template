import { Link } from '@adobe/react-spectrum';

function SideBar() {
    return (
        <ul className="SideNav">
            <li className="SideNav-item">
                <Link aria-label="Home" href="/">
                    Home
                </Link>
            </li>
            <li className="SideNav-item">
                <Link aria-label="About" href="/about">
                    About App Builder
                </Link>
            </li>
        </ul>
    );
}

export default SideBar;
