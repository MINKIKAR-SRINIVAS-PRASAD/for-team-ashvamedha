"use client";

import { motion } from "framer-motion";
import { Trophy as TrophyIcon } from "lucide-react";
import { Crest } from "@/components/art/Crest";
import type { Team } from "@/data/teams";
import { useFestData } from "@/components/FestDataProvider";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ============================================================================
   ASHVAMEDHA 2026 — ORGANIZING COMMITTEE
   ========================================================================== */

type CommitteeMember = {
  name: string;
  role?: string;
  team?: string;
  image?: string;
};

/*
 * Replace the placeholder Cloudinary URLs with your real Cloudinary links.
 *
 * Example:
 * image: "https://res.cloudinary.com/your-cloud/image/upload/v123456/team/shashank.jpg"
 */

/* ---------------------------------------------------------------------------
   CHIEF COORDINATOR
   ------------------------------------------------------------------------- */

const CHIEF_COORDINATOR: CommitteeMember = {
  name: "Shashank Vadekar",
  role: "Chief Coordinator",
  image: "PASTE_SHASHANK_CLOUDINARY_URL_HERE",
};

/* ---------------------------------------------------------------------------
   TEAM COORDINATORS
   ------------------------------------------------------------------------- */

const TEAM_COORDINATORS: CommitteeMember[] = [
  {
    name: "Radhika Singh Chauhan",
    role: "Team Coordinator",
    team: "Webnd",
    image: "PASTE_RADHIKA_CLOUDINARY_URL_HERE",
  },
  {
    name: "Suhas Rao",
    role: "Team Coordinator",
    team: "Hospitality",
    image: "PASTE_SUHAS_CLOUDINARY_URL_HERE",
  },
  {
    name: "HIMANSHU BINWAL",
    role: "Team Coordinator",
    team: "Events & Management",
    image: "PASTE_HIMANSHU_CLOUDINARY_URL_HERE",
  },
  {
    name: "Harkeshav K. Bhardwaj",
    role: "Team Coordinator",
    team: "Publicity",
    image: "PASTE_HARKESHAV_CLOUDINARY_URL_HERE",
  },
  {
    name: "Hisham Ahmed MKP",
    role: "Team Coordinator",
    team: "Sponsors",
    image: "PASTE_HISHAM_CLOUDINARY_URL_HERE",
  },
];

/* ---------------------------------------------------------------------------
   CORE HEADS
   ------------------------------------------------------------------------- */

const CORE_HEADS: CommitteeMember[] = [
  /* WEBND */
  {
    name: "Srinivas Prasad",
    role: "Core Head",
    team: "Webnd",
    image: "PASTE_SRINIVAS_CLOUDINARY_URL_HERE",
  },
  {
    name: "Samiksha",
    role: "Core Head",
    team: "Webnd",
    image: "PASTE_SAMIKSHA_CLOUDINARY_URL_HERE",
  },
  {
    name: "Ayanam Geethanvitha",
    role: "Core Head",
    team: "Webnd",
    image: "PASTE_AYANAM_CLOUDINARY_URL_HERE",
  },

  /* HOSPITALITY */
  {
    name: "Sidhu Jarpula",
    role: "Core Head",
    team: "Hospitality",
    image: "PASTE_SIDHU_CLOUDINARY_URL_HERE",
  },
  {
    name: "SARVESWARNAIK",
    role: "Core Head",
    team: "Hospitality",
    image: "PASTE_SARVESWARNAIK_CLOUDINARY_URL_HERE",
  },
  {
    name: "Vachan Potnuru",
    role: "Core Head",
    team: "Hospitality",
    image: "PASTE_VACHAN_CLOUDINARY_URL_HERE",
  },

  /* EVENTS & MANAGEMENT */
  {
    name: "Sanjith Rao. L",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_SANJITH_CLOUDINARY_URL_HERE",
  },
  {
    name: "Pruthviraj Rameshwar Potbhare",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_PRUTHVIRAJ_CLOUDINARY_URL_HERE",
  },
  {
    name: "Rajeev jalthaniya",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_RAJEEV_CLOUDINARY_URL_HERE",
  },
  {
    name: "Mayank Jeet",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_MAYANK_CLOUDINARY_URL_HERE",
  },
  {
    name: "Uttam Chouhan",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_UTTAM_CLOUDINARY_URL_HERE",
  },
  {
    name: "N.Vishal",
    role: "Core Head",
    team: "Events & Management",
    image: "PASTE_NVISHAL_CLOUDINARY_URL_HERE",
  },

  /* PUBLICITY */
  {
    name: "Riidhi Sanjay bagade",
    role: "Core Head",
    team: "Publicity",
    image: "PASTE_RIIDHI_CLOUDINARY_URL_HERE",
  },
  {
    name: "SHIVANSH SAHU",
    role: "Core Head",
    team: "Publicity",
    image: "PASTE_SHIVANSH_CLOUDINARY_URL_HERE",
  },
  {
    name: "VISHNU MAIDA",
    role: "Core Head",
    team: "Publicity",
    image: "PASTE_VISHNU_CLOUDINARY_URL_HERE",
  },

  /* SPONSORSHIP */
  {
    name: "Siddharth Deva",
    role: "Core Head",
    team: "Sponsorship",
    image: "PASTE_SIDDHARTH_CLOUDINARY_URL_HERE",
  },
  {
    name: "Garvit",
    role: "Core Head",
    team: "Sponsorship",
    image: "PASTE_GARVIT_CLOUDINARY_URL_HERE",
  },
];

/* ============================================================================
   COMMITTEE CARD
   ========================================================================== */

function CommitteeCard({
  member,
  featured = false,
}: {
  member: CommitteeMember;
  featured?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        ease: EASE,
      }}
      className={cn(
        "group relative flex flex-col items-center text-center",
        featured
          ? "w-full max-w-[340px]"
          : "w-full max-w-[310px]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-full border border-white/15 bg-[#0b0e14]",
          "transition-all duration-500 group-hover:-translate-y-1",
          "group-hover:border-white/35",
          featured
            ? "h-40 w-40 sm:h-44 sm:w-44"
            : "h-28 w-28 sm:h-32 sm:w-32",
        )}
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.02), 0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        {member.image &&
        !member.image.startsWith("PASTE_") ? (
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-crimson-deep/40 via-graphite to-black">
            <span
              className={cn(
                "font-display uppercase text-white/90",
                featured ? "text-4xl" : "text-2xl",
              )}
            >
              {member.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
          </div>
        )}

        {/* glow ring */}
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-crimson/60" />
      </div>

      <div className="mt-4">
        <h3
          className={cn(
            "font-display uppercase leading-none text-white",
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          )}
        >
          {member.name}
        </h3>

        {member.role && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-crimson">
            {member.role}
          </p>
        )}

        {member.team && (
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-silver-dim">
            {member.team}
          </p>
        )}
      </div>
    </motion.article>
  );
}

/* ============================================================================
   ORGANIZING COMMITTEE
   ========================================================================== */

function OrganizingCommittee() {
  return (
    <section className="mb-20">
      {/* Section heading */}
      <div className="mb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-crimson">
          ASHVAMEDHA 2026
        </p>

        <h2 className="mt-3 text-4xl text-white sm:text-5xl">
          Organizing Committee
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-silver-dim">
          The people behind the arena, the events and everything that keeps
          ASHVAMEDHA moving.
        </p>
      </div>

      {/* ================================================================
          CHIEF COORDINATOR
         ================================================================ */}

      <div className="mb-16 flex justify-center">
        <CommitteeCard
          member={CHIEF_COORDINATOR}
          featured
        />
      </div>

      {/* ================================================================
          TEAM COORDINATORS
         ================================================================ */}

      <div className="mb-16">
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-silver-dim">
            Leadership
          </p>

          <h3 className="mt-2 font-display text-2xl uppercase text-white sm:text-3xl">
            Team Coordinators
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
          {TEAM_COORDINATORS.map((member) => (
            <div
              key={`${member.team}-${member.name}`}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)]"
            >
              <CommitteeCard member={member} />
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
          CORE HEADS
         ================================================================ */}

      <div>
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-silver-dim">
            Department Leadership
          </p>

          <h3 className="mt-2 font-display text-2xl uppercase text-white sm:text-3xl">
            Core Heads
          </h3>
        </div>

        {/*
         * flex-wrap + justify-center is intentional.
         *
         * On desktop:
         *   3 cards per row
         *
         * If the final row has:
         *   1 card → centered
         *   2 cards → centered
         *   3 cards → full row
         */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-12">
          {CORE_HEADS.map((member) => (
            <div
              key={`${member.team}-${member.name}`}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <CommitteeCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PARTICIPATING TEAMS
   ========================================================================== */

export function Teams({ limit }: { limit?: number }) {
  const { teams } = useFestData();
  const list = limit
    ? teams.slice(0, limit)
    : teams;

  return (
    <div>
      {/* ORGANIZING COMMITTEE */}
      <OrganizingCommittee />

      {/* PARTICIPATING TEAMS */}
      <section>
        <div className="mb-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-crimson">
            ASHVAMEDHA 2026
          </p>

          <h2 className="mt-3 text-4xl text-white sm:text-5xl">
            Participating Teams
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((team, i) => (
            <TeamCard
              key={team.slug}
              team={team}
              index={i}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
   PARTICIPATING TEAM CARD
   ========================================================================== */

function TeamCard({
  team,
  index,
}: {
  team: Team;
  index: number;
}) {
  return (
    <motion.article
      id={team.slug}
      initial={{
        opacity: 0,
        y: 26,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.6,
        ease: EASE,
        delay: Math.min(
          index * 0.045,
          0.4,
        ),
      }}
      className="group relative scroll-mt-28 overflow-hidden panel clip-notch p-5 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.02]"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* hover wash */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top, ${team.crest[0]}22, transparent 68%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className="transition-transform duration-500 group-hover:scale-[1.06]"
          style={{
            filter: "drop-shadow(0 0 0 transparent)",
          }}
        >
          <span
            className="block transition-[filter] duration-500 group-hover:[filter:drop-shadow(0_0_18px_var(--team-glow))]"
            style={{
              ["--team-glow" as string]:
                `${team.crest[0]}bb`,
            }}
          >
            <Crest
              name={team.name}
              colors={team.crest}
              size={62}
            />
          </span>
        </div>

        {team.rank ? (
          <span
            className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] tracking-hud"
            style={{
              borderColor: `${team.crest[0]}66`,
              color: team.crest[0],
            }}
          >
            <TrophyIcon className="h-3 w-3" />
            #{team.rank}
          </span>
        ) : (
          <span className="tag">
            UNSEEDED
          </span>
        )}
      </div>

      <h3 className="relative mt-4 text-[1.35rem] leading-none text-white">
        {team.name}
      </h3>

      <p className="relative mt-2 font-mono text-[9px] tracking-hud text-silver-dim">
        {team.sport.toUpperCase()}
      </p>

      <dl className="relative mt-4 space-y-1.5 border-t border-white/10 pt-3.5 text-[0.8rem]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">
            INSTITUTE
          </dt>

          <dd className="truncate text-right text-silver">
            {team.institution}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">
            DEPT
          </dt>

          <dd className="truncate text-right text-silver-dim">
            {team.department}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">
            CAPTAIN
          </dt>

          <dd className="text-right text-white">
            {team.captain}
          </dd>
        </div>
      </dl>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background: `linear-gradient(90deg, ${team.crest[0]}, transparent)`,
        }}
      />
    </motion.article>
  );
}

/* ============================================================================
   COMPACT TEAM CHIP
   Used by podium / results pages.
   ========================================================================== */

export function TeamChip({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { teams } = useFestData();

  const team = teams.find(
    (t) => t.slug === slug,
  );

  if (!team) {
    return null;
  }

  return (
    <span
      className={cn(
        "flex items-center gap-2.5",
        className,
      )}
    >
      <Crest
        name={team.name}
        colors={team.crest}
        size={26}
      />

      <span className="text-[0.9rem] text-white">
        {team.name}
      </span>
    </span>
  );
}
