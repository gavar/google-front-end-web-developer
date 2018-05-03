import * as company from "./companies";
import * as tech from "./technologies";
import {Project} from "./types";

// tslint:disable:variable-name
export const Fronted: Project = {
    title: "Fronted",
    url: "http://fronted.com/",
    dateFrom: new Date(2017, 3),
    dateTo: dateAdd(new Date(), "day", 1),
    company: company.SafetyWing,
    role: "Backend Developer",
    technologies: [tech.Java, tech.Spring, tech.MySQL, tech.Maven, tech.NodeJS, tech.TypeScript, tech.Handlebars, tech.Gulp],
    post: {
        gallery: {
            style: "none wip",
            items: [{
                type: "image",
                href: "img/wip-image.png",
            }],
        },
        content: `<p>
The project dedicated to freelancers and small business, who wondering how to promote their product
and find new customers. Fronted is going to solve that problem by introducing expert evaluation of your
project needs; by providing marketing team and promoting your product using an embedded social platform.
</p>`,
    },
};

export const MyCountryAR: Project = {
    title: "My Country AR",
    url: "http://www.game-insight.com/games/my-country",
    dateFrom: new Date(2017, 9),
    dateTo: new Date(2017, 10),
    role: "Developer / Tech Lead",
    company: company.GameInsight,
    technologies: [tech.Unity3D, tech.CSharp, tech.Java, tech.Jenkins, tech.JIRA],
    apps: [
        {
            type: "app-store",
            href: "https://itunes.apple.com/US/app/id1247796322",
        },
    ],
    post: {
        gallery: {
            style: "phone",
            items: [{
                type: "image",
                href: "img/projects/my-country-ar/9x16/my-country-ar-screen-1.jpeg",
            }, {
                type: "image",
                href: "img/projects/my-country-ar/9x16/my-country-ar-screen-2.jpeg",
            }, {
                type: "image",
                href: "img/projects/my-country-ar/9x16/my-country-ar-screen-3.jpeg",
            }, {
                type: "image",
                href: "img/projects/my-country-ar/9x16/my-country-ar-screen-4.jpeg",
            }, {
                type: "image",
                href: "img/projects/my-country-ar/9x16/my-country-ar-screen-5.jpeg",
            }],
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
    },
};

export const Moana: Project = {
    title: "Moana Island Life",
    url: "http://www.game-insight.com/en/games/moana",
    dateFrom: new Date(2017, 2),
    dateTo: new Date(2017, 8),
    company: [company.GameInsight, company.Disney],
    role: "Developer / Tech Lead",
    technologies: [tech.Unity3D, tech.CSharp, tech.Java, tech.TypeScript, tech.AWSLambda, tech.Serverless, tech.Jenkins, tech.JIRA],
    apps: [{
        type: "app-store",
        href: "https://itunes.apple.com/app/moana-island-life/id1127517805",
    }, {
        type: "google-play",
        href: "https://play.google.com/store/apps/details?id=com.disney.moanaislandlife_goo",
    }, {
        type: "amazon",
        href: "https://www.amazon.com/Disney-Moana-Island-Life/dp/B01N6HRBC6",
    }],
    post: {
        gallery: {
            style: "phone",
            items: [{
                type: "image",
                href: "img/projects/moana/9x16/moana-screen-1.jpg",
            }, {
                type: "image",
                href: "img/projects/moana/9x16/moana-screen-2.jpg",
            }, {
                type: "image",
                href: "img/projects/moana/9x16/moana-screen-3.jpg",
            }, {
                type: "image",
                href: "img/projects/moana/9x16/moana-screen-4.jpg",
            }, {
                type: "image",
                href: "img/projects/moana/9x16/moana-screen-5.jpg",
            }],
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
    },
};

export const Konsus: Project = {
    title: "Konsus",
    url: "https://www.konsus.com/",
    dateFrom: new Date(2016, 2),
    dateTo: new Date(2016, 9),
    company: company.Konsus,
    role: "Full Stack Web Developer",
    technologies: [tech.Java, tech.Spring, tech.JavaScript, tech.TypeScript, tech.React, tech.NodeJS, tech.Webpack],
    post: {
        gallery: {
            style: "horizontal tablet",
            items: [{
                type: "image",
                href: "img/projects/konsus/konsus-website-1.jpg",
            }, {
                type: "image",
                href: "img/projects/konsus/konsus-website-2.jpg",
            }, {
                type: "image",
                href: "img/projects/konsus/konsus-website-3.jpg",
            }],
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
    },
};

export const MyCountry3D: Project = {
    title: "My Country 3D",
    url: "https://www.game-insight.com/en/news/game-insight-unveils-details-around-its-upcoming-title-my-country-3d",
    dateFrom: new Date(2013, 10),
    dateTo: new Date(2017, 0),
    company: company.GameInsight,
    role: "Developer / Tech Lead",
    technologies: [tech.Unity3D, tech.CSharp, tech.Java, tech.Jenkins, tech.JIRA],
    post: {
        gallery: {
            style: "horizontal phone",
            items: [{
                type: "image",
                href: "img/projects/my-country-3d/my-country-3d-01.jpg",
            }, {
                type: "image",
                href: "img/projects/my-country-3d/my-country-3d-02.jpg",
            }, {
                type: "image",
                href: "img/projects/my-country-3d/my-country-3d-03.jpg",
            }, {
                type: "image",
                href: "img/projects/my-country-3d/my-country-3d-04.jpg",
            }],
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
    },
};

export const HunterX: Project = {
    title: "HunterX - Zombie Shooter",
    url: "https://www.facebook.com/HunterXZombieShooter/",
    dateFrom: new Date(2013, 1),
    dateTo: new Date(2013, 8),
    company: company.TSG,
    role: "Developer / Co-Founder",
    technologies: [tech.Unity3D, tech.CSharp],
    apps: [{
        type: "google-play",
        href: "https://apkpure.com/hunterx-zombie-shooter/com.TSGStudio.HunterX",
    }],
    post: {
        gallery: {
            style: "horizontal phone",
            items: [{
                type: "image",
                href: "img/projects/hunter-x/hunter-x-01.jpg",
            }, {
                type: "video",
                href: "img/projects/hunter-x/hunter-x-trailer.mp4",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-02.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-03.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-04.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-05.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-06.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-07.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-08.jpg",
            }, {
                type: "image",
                href: "img/projects/hunter-x/hunter-x-09.jpg",
            }],
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
    },
};

const projects = [
    Fronted,
    MyCountryAR,
    Moana,
    Konsus,
    MyCountry3D,
    HunterX,
];

// sort by 'dateTo' descending
projects.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

export default projects;

type TimeUnit = "year" | "month" | "day" | "hour" | "second";
function dateAdd(date: Date, unit: TimeUnit, interval: number): Date {
    date = new Date(date); // don't change original date
    switch (unit.toLowerCase()) {
        case "year":
            date.setFullYear(date.getFullYear() + interval);
            break;
        case "month":
            date.setMonth(date.getMonth() + interval);
            break;
        case "day":
            date.setDate(date.getDate() + interval);
            break;
        case "hour":
            date.setTime(date.getTime() + interval * 60 * 60 * 1000);
            break;
        case "minute":
            date.setTime(date.getTime() + interval * 60 * 1000);
            break;
        case "second":
            date.setTime(date.getTime() + interval * 1000);
            break;
        default :
            throw new Error(`unknown type unit: ${unit}`);
    }
    return date;
}
