import { createRouter, createWebHistory } from "vue-router";
import Home from "../../views/Home.vue";
import Login from "../../views/Login.vue";
import PLayers from "../../views/PLayers.vue";
import Teams from "../../views/Teams.vue";
import Matches from "../../views/Matches.vue";
import Stats from "../../views/Stats.vue";
import Standings from "../../views/Standings.vue";
import Schedule from "../../views/Schedule.vue";
import MatchDetail from "../../views/MatchDetail.vue";
const routes = [
    {
        path: "/home",
        component: Home
    },
    {
        path: "/players",
        component: PLayers
    },
    {
        path: "/teams",
        component: Teams
    },
    {
        path: "/matches",
        component: Matches
    },
    {
        path: "/stats",
        component: Stats
    },
    {
        path: "/standings",
        component: Standings
    },
    {
        path: "/schedule",
        component: Schedule
    },
    {
        path: "/match/:matchId",
        component: MatchDetail
    },
    {
        path: "/",
        component: Login
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
