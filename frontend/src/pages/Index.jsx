import "../assets/css/index.css";
import donkeyKong from "../assets/images/donkey-kong.webp";
import indianaJones from "../assets/images/indiana-jones.webp";
import zelda from "../assets/images/zelda.webp";
import hogwarts from "../assets/images/hogwarts.webp";
import pokemon from "../assets/images/pokemon.webp";
import HeroVid from "../assets/videos/hero-bg.webp";
import HeroTitle from "../components/SVGs/HeroTitle";
import BenefitIcon1 from "../components/SVGs/BenefitIcon1";
import BenefitIcon2 from "../components/SVGs/BenefitIcon2";
import BenefitIcon3 from "../components/SVGs/BenefitIcon3";
import ItemSlider from "../components/ItemSlider";

// TODO: Hot it works, About the games, Featured Games, Benefits, Testimonials/Reviews, FAQs

export default function Index() {
  const featuredGames = [
    { name: "Donkey Kong", genre: "Action", img: donkeyKong },
    { name: "Indiana Jones", genre: "RPG", img: indianaJones },
    { name: "Pokemon ZA", genre: "Racing", img: pokemon },
    { name: "Zelda", genre: "RPG", img: zelda },
    { name: "Hogwarts", genre: "RPG", img: hogwarts },
  ];

  const newReleases = [
    { name: "Mario Kart", genre: "Racing", img: hogwarts },
    { name: "Pokemon ZA", genre: "Racing", img: pokemon },
    { name: "Zelda", genre: "RPG", img: zelda },
    { name: "Hogwarts", genre: "RPG", img: hogwarts },
    { name: "Super Smash Bros", genre: "Fighting", img: zelda },
  ];

  const topRated = [
    { name: "Zelda", genre: "RPG", img: zelda },
    { name: "Donkey Kong", genre: "Action", img: donkeyKong },
    { name: "Indiana Jones", genre: "RPG", img: indianaJones },
    { name: "Pokemon ZA", genre: "Racing", img: pokemon },
  ];

  return (
    <main className="home-main">
      <Hero />

      <Benefits />

      {/* Featured Games Slider */}
      <ItemSlider
        title="Featured Games"
        items={featuredGames}
        moreLink="/games"
        right={true}
      />

      {/* New Releases Slider */}
      <ItemSlider title="New Releases" items={newReleases} moreLink="/games" />

      {/* Top Rated Slider */}
      <ItemSlider
        title="Top Rated"
        items={topRated}
        moreLink="/games"
        right={true}
      />
    </main>
  );
}

const Hero = () => {
  return (
    <section className="hero">
      {
        // * Hero Background
      }
      <img
        src={HeroVid}
        alt="A montage of games"
        className="hero-bg"
        loading="eager"
        decoding="async"
      />
      {
        // ! TV Effect Overlay
      }
      <div className="tv-effect"></div>
      <div className="width-wrap">
        {
          // * Hero Title
        }
        <h1 className="hero-title">
          <HeroTitle />
        </h1>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefitsData = [
    {
      title: "Affordable",
      description: "Play story-driven games without spending a fortune.",
      icon: <BenefitIcon1 />,
    },
    {
      title: "Flexible",
      description: "Borrow games for the exact duration you need.",
      icon: <BenefitIcon2 />,
    },
    {
      title: "Sustainable",
      description: "Share games with the community instead of buying new ones.",
      icon: <BenefitIcon3 />,
    },
  ];

  return (
    <section className="benefits">
      <div className="width-wrap">
        <h2 className="title">
          <span className="pixel">►</span> Why Re:Play?
        </h2>
        <div className="benefits-ctr">
          {benefitsData.map((benefit, i) => (
            <div className="card" key={i}>
              {benefit.icon}
              <div className="info">
                <h3 className="name">{benefit.title}</h3>
                <p className="desc">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
