export const typeColors: Record<string, string> = {
  fire: "#EE8130",
  water: "#6390F0",
  grass: "#7AC74C",
  electric: "#F7D02C",
  psychic: "#F95587",
  ice: "#96D9D6",
  dragon: "#6F35FC",
  dark: "#705746",
  fairy: "#D685AD",
  normal: "#A8A77A",
  fighting: "#C22E28",
  flying: "#A98FF3",
  poison: "#A33EA1",
  ground: "#E2BF65",
  rock: "#B6A136",
  bug: "#A6B91A",
  ghost: "#735797",
  steel: "#B7B7CE",
};

export const dashStyles = {
  container: {
    gap: 6,
    p: "24px",
    align: "stretch" as const,
    fontFamily: "Fira Sans",
    w: "calc(100vw - 48px)",
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    maxW: "1920px",
  },
  mainHeading: { textAlign: "center" as const },
  connectionBox: {
    borderWidth: "1px",
    borderRadius: "md",
    p: 4,
    boxShadow: "sm",
  },
  inputBox: { mb: 2 },
  hstackGap: { gap: 3, align: "stretch" as const },
  mainGrid: {
    flex: 1,
    align: "stretch",
    w: "100%",
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};

export const cardStyles = {
  isWinner: {
    borderRadius: "10px",
    boxShadow: `
    0 0 10px 2px gold,          /* subtle outer glow */
    0 0 20px 5px rgba(255, 215, 0, 0.6), /* larger, soft glow */
    inset 0 0 10px rgba(255, 223, 0, 0.8) /* inner highlight */
  `,
    transition: "box-shadow 0.3s ease-in-out", // smooth glow transition
  },
  card: {
    borderRadius: "xl",
    boxShadow: "xl",
    w: "300px",
    overflow: "hidden",
    textAlign: "center" as const,
    position: "relative" as const,
    bg: "white",
    color: "black",
  },
  topSection: (types: string[]) => {
    const colors = types.map(
      (type) => typeColors[type.toLowerCase()] || "#A8A77A"
    );
    const bg =
      colors.length === 2
        ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
        : colors[0];
    return {
      bg,
      h: "160px",
      borderBottomRadius: "full",
      position: "relative" as const,
      zIndex: 0,
    };
  },
  hpPill: {
    position: "absolute" as const,
    top: "3",
    right: "3",
    bg: "white",
    px: "3",
    py: "1",
    borderRadius: "full",
    fontSize: "sm",
    fontWeight: "bold",
    zIndex: 2,
  },
  spriteWrapper: {
    mt: "-90px",
    position: "relative" as const,
    zIndex: 1,
  },
  sprite: {
    boxSize: "200px",
    objectFit: "contain" as const,
    m: "-50px",
    mb: "-25px",
  },
  name: {
    fontSize: "xl",
    mt: 2,
  },
  typeHStack: {
    justify: "center" as const,
    mt: 3,
    spacing: 2,
  },
  typeBadge: (color: string) => ({
    bg: color,
    color: "white",
    px: 3,
    py: 1,
    borderRadius: "full",
    textTransform: "uppercase" as const,
  }),
  statsHStack: {
    justify: "space-around" as const,
    mt: 4,
    mb: 6,
  },
  statLabel: {
    fontSize: "sm",
    color: "gray.600",
  },
  statValue: {
    fontWeight: "bold",
  },
  voteButton: (types: string[]) => {
    const colors = types.map(
      (type) => typeColors[type.toLowerCase()] || "#A8A77A"
    );
    const bg =
      colors.length === 2
        ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
        : colors[0];
    return {
      bg,
      w: "full",
      py: 6,
      _hover: { opacity: 0.9 },
      borderRadius: "0",
      color: "black",
    };
  },
};

export const chatStyles = {
  chatBox: {
    borderWidth: "1px",
    borderRadius: "md",
    p: 4,
    boxShadow: "sm",
    h: "100%",
  },
  chatHeading: { size: "md" as const, mb: 4 },
  chatMessages: {
    gap: 2,
    align: "stretch" as const,
    h: "290px",
    overflowY: "auto",
    mb: 2,
    minW: "300px ",
  },
  chatMessage: (fromYou: boolean) => ({
    bg: fromYou ? "blue.400" : "gray.600",
    p: 2,
    borderRadius: fromYou ? "10px 10px 0px 10px" : "10px 10px 10px 0px",
    alignSelf: fromYou ? "flex-end" : "flex-start",
    fontSize: "sm",
  }),
  chatInputBox: { gap: 2 },
};

export const globalStyles = {
  input: {
    bgColor: "#909090ff",
    color: "black",
    _placeholder: {
      color: "blackAlpha.600",
    },
  },
  button: {
    color: "white",
  },
};
