import { Routes, Route} from "react-router-dom";
import Home from "./pages/home/index";
import TextGeneration from "./pages/text-generation";

function MainRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/text-generation" element={<TextGeneration />} />
        </Routes>
    )
}

export default MainRoutes;