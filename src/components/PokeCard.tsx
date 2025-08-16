import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Button,
} from "@chakra-ui/react";
import type { Pokemon } from "../types/pokemon";
import { cardStyles as styles } from "./styles";
import { typeColors } from "./styles";

interface PokeCardProps {
  data: Pokemon;
  onVote: (pokemon: string) => void;
  votes: number;
  hasVoted: boolean;
  isWinner: boolean;
}

export const PokeCard: React.FC<PokeCardProps> = ({
  data,
  onVote,
  votes,
  hasVoted,
  isWinner,
}) => {
  const mainType = data.types[0]?.toLowerCase() || "normal";
  const color = typeColors[mainType] || "#A8A77A";

  return (
    <Box {...styles.card} {...(isWinner && styles.isWinner)}>
      {/* Top Section */}
      <Box {...styles.topSection(data.types)}>
        <Box {...styles.hpPill}>EXP {data.base_experience}</Box>
      </Box>

      {/* Sprite */}
      <VStack {...styles.spriteWrapper}>
        <Image src={data.sprite} alt={data.name} {...styles.sprite} />
        <Heading {...styles.name}>{data.name}</Heading>
      </VStack>

      {/* Types */}
      <HStack {...styles.typeHStack}>
        {data.types.map((type) => (
          <Badge key={type} {...styles.typeBadge(typeColors[type] || "#333")}>
            {type}
          </Badge>
        ))}
      </HStack>

      {/* Stats */}
      <HStack {...styles.statsHStack}>
        <VStack gap={0}>
          <Text {...styles.statValue}>{data.weight}</Text>
          <Text {...styles.statLabel}>Weight</Text>
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statValue}>{data.height}</Text>
          <Text {...styles.statLabel}>Height</Text>
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statValue}>{data.base_experience}</Text>
          <Text {...styles.statLabel}>EXP</Text>
        </VStack>
      </HStack>

      {/* Vote button */}
      <Button
        {...styles.voteButton(data.types)}
        onClick={() => onVote(data.name)}
        disabled={hasVoted}
      >
        Vote ({votes})
      </Button>
    </Box>
  );
};
