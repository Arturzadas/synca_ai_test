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
import { FaWeightHanging } from "react-icons/fa";
import { GiBodyHeight } from "react-icons/gi";

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
  return (
    <Box {...styles.card} {...(isWinner && styles.isWinner)}>
      {/* Top Section */}
      <Box {...styles.topSection(data.types)}>
        <Box {...styles.hpPill}>XP {data.base_experience}</Box>
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
          <Text {...styles.statLabel}>
            <FaWeightHanging />
          </Text>
          <Text {...styles.statValue}>{data.weight}</Text>
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statLabel}>
            <GiBodyHeight />
          </Text>
          <Text {...styles.statValue}>{data.height}</Text>
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statLabel} fontWeight={"bold"}>
            XP
          </Text>
          <Text {...styles.statValue}>{data.base_experience}</Text>
        </VStack>
      </HStack>

      <Button
        {...styles.voteButton(data.types)}
        onClick={() => onVote(data.name)}
        disabled={hasVoted}
      >
        Vote
        <Badge>{votes}</Badge>
      </Button>
    </Box>
  );
};
