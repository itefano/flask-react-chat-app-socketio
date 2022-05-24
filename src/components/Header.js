import logo from "../logo.svg";
import axios from "axios";
function Header(props) {
    function logMeOut() {
        axios({
            method: "GET",
            url: "/api/logout",
        })
            .then((response) => {
                props.removeToken();
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    }
    return (
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />{" "}
            {!props.token && props.token !== "" && props.token !== undefined ? (
                ""
            ) : (
                <button onClick={logMeOut}>Logout</button>
            )}
        </header>
    );
}
export default Header;
