import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./contexts/UserContext";
export default function Private(props){

    const loggedData=useContext(UserContext)
    return (
        loggedData.loggedUser!=null
        ?
        <props.Component/>
        :
        <Navigate to="/"/>
    )

}
