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

interface PokeCardProps {
  data: Pokemon;
  onVote: (pokemon: string) => void;
  votes: number; // number of votes for this Pokémon
  hasVoted: boolean; // to optionally disable the button after voting
}

export const PokeCard: React.FC<PokeCardProps> = ({
  data,
  onVote,
  votes,
  hasVoted,
}) => {
  return (
    <Box {...styles.card}>
      {/* Sprite & Name */}
      <VStack {...styles.spriteWrapper}>
        <Image src={data.sprite} alt={data.name} {...styles.sprite} />
        <Heading {...styles.name}>{data.name}</Heading>
      </VStack>

      {/* Basic Info */}
      <VStack {...styles.infoWrapper}>
        <Text>
          <strong>ID:</strong> {data.id}
        </Text>
        <Text>
          <strong>Height:</strong> {data.height}
        </Text>
        <Text>
          <strong>Weight:</strong> {data.weight}
        </Text>
        <Text>
          <strong>Base Experience:</strong> {data.base_experience}
        </Text>
      </VStack>

      {/* Types */}
      <Box mt={4}>
        <Text {...styles.sectionTitle}>Types:</Text>
        <HStack {...styles.badgeHStack}>
          {data.types.map((type) => (
            <Badge key={type} {...styles.typeBadge}>
              {type}
            </Badge>
          ))}
        </HStack>
      </Box>

      {/* Abilities */}
      <Box mt={4}>
        <Text {...styles.sectionTitle}>Abilities:</Text>
        <HStack {...styles.badgeHStack}>
          {data.abilities.map((ability) => (
            <Badge key={ability} {...styles.abilityBadge}>
              {ability}
            </Badge>
          ))}
        </HStack>
      </Box>

      {/* Vote Button */}
      <Button
        {...styles.voteButton}
        onClick={() => onVote(data.name)}
        disabled={hasVoted}
      >
        Vote ({votes})
      </Button>
    </Box>
  );
};
