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
                <Link aria-label="Sample Action" href="/sample-action">
                    Sample Action
                </Link>
            </li>
            <li className="SideNav-item">
                <Link aria-label="Documentation" href="/documentation">
                    Documentation
                </Link>
            </li>
        </ul>
    );
}

export default SideBar;
