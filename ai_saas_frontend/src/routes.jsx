import { Routes, Route} from "react-router-dom";
import Home from "./pages/home/index";
import TextGeneration from "./pages/text-generation";
import ImageGeneration from "./pages/image-generation";
import VideoGeneration from "./pages/video-generation";
import Login from "./pages/login";

function MainRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/text-generation" element={<TextGeneration />} />
            <Route path="/image-generation" element={<ImageGeneration />} />
            <Route path="/video-generation" element={<VideoGeneration />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    )
}

export default MainRoutes;