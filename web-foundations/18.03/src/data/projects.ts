import {Disney, GameInsight, Konsus, SafetyWing, TSG} from "./companies";
import {
    AWSLambda, CSharp, Gulp, Java, Jenkins, JIRA, Maven, MySQL, NodeJS, Serverless, Spring, TypeScript,
    Handlebars, Unity3D, JavaScript, React, Webpack
} from "./technologies";
import {Project} from "./types";

export const Fronted: Project = {
    title: "Fronted",
    url: "http://fronted.com/",
    dateFrom: new Date(2017, 3),
    dateTo: new Date(),
    company: SafetyWing,
    role: "Backend Developer",
    technologies: [Java, Spring, MySQL, Maven, NodeJS, TypeScript, Handlebars, Gulp],
    post: {
        gallery: {
            boxType: "wip",
            items: [{
                type: "image",
                href: "assets/wip-image.png"
            }]
        },
        content: `<p>
The project dedicated to freelancers and small bossiness, who wondering how to promote their product
and find new customers. Fronted is going to solve that problem by introducing expert evaluation of your
project needs; by providing marketing team and promoting your product using an embedded social platform.
</p>`,
    }
};

export const MyCountryAR: Project = {
    title: "My Country AR",
    url: "http://www.game-insight.com/games/my-country",
    dateFrom: new Date(2017, 9),
    dateTo: new Date(2017, 10),
    role: "Developer / Tech Lead",
    company: GameInsight,
    technologies: [Unity3D, CSharp, Java, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            items: [{
                type: "image",
                href: "assets/projects/my-country-ar/my-country-ar-01.jpg"
            }]
        },
        content: `<p>
Welcome to the first game that lets you build your own country in <strong>augmented reality!</strong> Using the
latest technologies, you can now bring entire worlds to life right in your living room. Discover miniature worlds
full of cute little people; run an airport, manage a train station and see how tall you can build the forest of
skyscrapers in your business district. Master an entire new dimension of fun – swoop and pan with your device to get
a better perspective look for hidden items around your cities to avert mishaps. </p>
<p>
<strong>The game was released on the first day of iOS augmented reality app
store and has been stated as first city-builder available in AR mode.</strong>
</p>
<h3>Contributions:</h3>
<ul>
    <li>core engine development</li>
    <li>progressive asset loading</li>
    <li>asset bundling and dependency management</li>
    <li>UI powered by <a rel="nofollow" target="_blank" href="https://bitbucket.org/Unity-Technologies/ui">uGUI</a> including <a rel="nofollow" target="_blank" href="https://reactjs.org/">React</a>-like rendering</li>
    <li>DLC (downloadable content) packages applied while you play</li>
    <li>the game mostly based on the engine from previous games</li>
</ul>
`,
    }
};

export const Moana: Project = {
    title: "Moana Island Life",
    url: "http://www.game-insight.com/en/games/moana",
    dateFrom: new Date(2017, 2),
    dateTo: new Date(2017, 8),
    company: [GameInsight, Disney],
    role: "Developer / Tech Lead",
    technologies: [Unity3D, CSharp, Java, TypeScript, AWSLambda, Serverless, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            orientation: "horizontal",
            items: [{
                type: "image",
                href: "assets/projects/moana/moana-01.jpg"
            }]
        },
        content: `<p>
The ocean has called you to Motunui! Create your own magical paradise inspired by <strong>Disney’s</strong>
animated film Moana. Join Moana, Maui, and more to create and customize your island, complete
quests to earn rewards, and discover the islands of Oceania. Your island adventure awaits!
</p>
<h3>Contributions:</h3>
<ul>
    <li>user analytics system</li>
    <li>core engine development</li>
    <li>progressive asset loading</li>
    <li>serverless backend via Amazon Lambda</li>
    <li>asset bundling and dependency management</li>
    <li>UI powered by <a rel="nofollow" target="_blank" href="https://bitbucket.org/Unity-Technologies/ui">uGUI</a> including <a rel="nofollow" target="_blank" href="https://reactjs.org/">React</a>-like rendering</li>
    <li>DLC (downloadable content) packages applied while you play</li>
</ul>
`,
    }
};

export const KonsusProject: Project = {
    title: "Konsus",
    url: "https://www.konsus.com/",
    dateFrom: new Date(2016, 2),
    dateTo: new Date(2016, 9),
    company: Konsus,
    role: "Full Stack Web Developer",
    technologies: [Java, Spring, JavaScript, TypeScript, React, NodeJS, Webpack],
    post: {
        gallery: {
            boxType: "tablet",
            items: [{
                type: "image",
                href: "assets/projects/konsus/konsus-website-1.png"
            }]
        },
        content: `<p>
<strong>Konsus</strong> is the world's first On-Demand Freelance Business Support service,
available 24/7 via chat. Konsus participated in the 2016 winter batch of <a rel="nofollow"
target="_blank" href="http://www.ycombinator.com/">Y Combinator</a> and raised $1.5 million.
</p>
<h3>Contributions:</h3>
<ul>
    <li>migration from NodeJS to Java Spring server</li>
    <li>fully functioning Java Spring server including existing and extra functionality</li>
    <li>an invoicing system including automatic billing and work hours tracking</li>
    <li>cross-device seamless authorization</li>
    <li>survey forms via React</li>
    <li>some of website components React</li>
    <li>user analytics via multiple platforms</li>
</ul>
`,
    }
};

export const MyCountry3D: Project = {
    title: "My Country 3D",
    url: "https://www.game-insight.com/en/news/game-insight-unveils-details-around-its-upcoming-title-my-country-3d",
    dateFrom: new Date(2013, 10),
    dateTo: new Date(2017, 0),
    company: GameInsight,
    role: "Developer / Tech Lead",
    technologies: [Unity3D, CSharp, Java, Jenkins, JIRA],
    post: {
        gallery: {
            boxType: "phone",
            orientation: "horizontal",
            items: [{
                type: "image",
                href: "assets/projects/my-country-3d/my-country-3d-03.png"
            }]
        },
        content: `<p>
<strong>My Country 3D</strong> is the full-3D follow-up to the smash-hit series, My Country!
Interact with your citizens on the street level as you build your city skyward! Explore new
frontiers and customize each building; it's an open world bounded only by your imagination!
Coming soon! The full-3D follow-up to the smash-hit series, <strong>My Country</strong>!

<h3>Contributions:</h3>
<ul>
    <li>UI powered by <a rel="nofollow" target="_blank" href="https://bitbucket.org/Unity-Technologies/ui">uGUI</a></li>
    <li>fully dynamic camera</li>
    <li>progressive asset loading</li>
    <li>asset bundling and dependency management</li>
    <li>DLC (downloadable content) packages applied while you play</li>
    <li>close-up interaction with people and whole city overview at the same time</li>
    <li>handling up to 100K components on scene using custom entity component system</li>
</ul>
</p>`,
    }
};

export const HunterX: Project = {
    title: "HunterX - Zombie Shooter",
    url: "https://www.facebook.com/HunterXZombieShooter/",
    dateFrom: new Date(2013, 1),
    dateTo: new Date(2013, 8),
    company: TSG,
    role: "Developer / Co-Founder",
    technologies: [Unity3D, CSharp],
    post: {
        gallery: {
            boxType: "phone",
            orientation: "horizontal",
            items: [{
                type: "video",
                href: "assets/projects/hunter-x/hunter-x-trailer.mp4"
            }]
        },
        content: `<p>
Planet has gone wrong and portals have been opened to evil creatures willing to conquer the
world. Main Hero - HunterX is a stylish guy who has come to save the planet and destroy all
the evil creatures. 60th feet tall head demon named "Red" is leading the attack on humanity
and has challenged all the mankind with clear intents to enslave the souls of mortals.
</p>
<ul>
  <li>UI powered by <a href="http://www.tasharen.com/?page_id=140">NGUI</a></li>
  <li>Integrations:
    <a rel="nofollow" target="_blank" href="http://www.giftiz.com/">Giftiz</a>,
    <a rel="nofollow" target="_blank" href="https://www.heyzap.com/">heyZap</a>,
    <a rel="nofollow" target="_blank" href="http://www.adcolony.com/">adColony</a>,
    <a rel="nofollow" target="_blank" href="http://www.flurry.com/">Flurry</a>,
    <a rel="nofollow" target="_blank" href="http://www.adbuddiz.com/">AdBuddiz</a>
  </li>
  <li>Platforms: Android, Standalone, Web Player</li>
</ul>
`,
    }
};

const projects = [
    Fronted,
    MyCountryAR,
    Moana,
    KonsusProject,
    MyCountry3D,
    HunterX,
];

// sort by 'dateTo' descending
projects.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

export default projects;
