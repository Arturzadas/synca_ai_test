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
  card: {
    maxW: "sm",
    w: "100%",
    borderWidth: "1px",
    borderRadius: "lg",
    overflow: "hidden",
    p: 4,
    boxShadow: "md",
    bg: "white",
    _dark: { bg: "gray.800" },
  },
  spriteWrapper: {
    spacing: 3,
  },
  sprite: {
    boxSize: "120px",
  },
  name: {
    size: "2xl" as const,
    textTransform: "capitalize",
  },
  infoWrapper: {
    align: "start",
    mt: 4,
    spacing: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  badgeHStack: {
    spacing: 2,
    mt: 1,
    wrap: "wrap",
  },
  typeBadge: {
    colorScheme: "teal",
    textTransform: "capitalize",
  },
  abilityBadge: {
    colorScheme: "purple",
    textTransform: "capitalize",
  },
  voteButton: {
    mt: 4,
    colorScheme: "blue",
    w: "full",
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
    h: "385px",
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
  },
};
