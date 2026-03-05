import AboutUs from "./components/AboutUs";
import CertifiedTraining from "./components/CertifiedTraining";
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";
import HowToSignUp from "./components/HowToSignUp";
import MissionVision from "./components/MissionVision";
import OurProducts from "./components/OurProducts";

export default function Home() {
  return (
    <div>
      <Hero />
      <AboutUs />
      <OurProducts />
      <MissionVision />
      <HowToSignUp />
      <CertifiedTraining />
      <ContactUs />
    </div>
  );
}
