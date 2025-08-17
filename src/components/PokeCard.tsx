import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  SkeletonText,
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
  isLoading: boolean;
}

export const PokeCard: React.FC<PokeCardProps> = ({
  data,
  onVote,
  votes,
  hasVoted,
  isWinner,
  isLoading = false,
}) => {
  return (
    <Box
      transition={"all 1s ease"}
      {...styles.card(data.types)}
      {...(isWinner && styles.isWinner)}
    >
      {/* Top Section */}
      <Box {...styles.topSection(data.types)}>
        <Box {...styles.hpPill}>XP {data.base_experience}</Box>
      </Box>

      {/* Sprite */}
      <VStack {...styles.spriteWrapper} transition={"all 0.3s ease"}>
        {isLoading ? (
          <Spinner {...styles.sprite} color={"white"} />
        ) : (
          <Image src={data.sprite} alt={data.name} {...styles.sprite} />
        )}
        {isLoading ? (
          <HStack w={"full"} opacity={0.1}>
            <SkeletonText
              noOfLines={1}
              {...styles.name}
              h={"30px"}
              w={"70px"}
              alignSelf={"center"}
              colorPalette={"cyan"}
            />
          </HStack>
        ) : (
          <Heading {...styles.name}>{data.name}</Heading>
        )}
      </VStack>

      {/* Types */}
      <HStack {...styles.typeHStack}>
        {isLoading ? (
          <Box h={"24px"}></Box>
        ) : (
          <>
            {data.types.map((type) => (
              <Badge
                key={type}
                {...styles.typeBadge(typeColors[type] || "#333")}
              >
                {type}
              </Badge>
            ))}
          </>
        )}
      </HStack>

      {/* Stats */}
      <HStack {...styles.statsHStack}>
        <VStack gap={0}>
          <Text {...styles.statLabel}>
            <FaWeightHanging />
          </Text>
          {isLoading ? (
            <HStack w={"full"} opacity={0.1}>
              <SkeletonText
                noOfLines={1}
                {...styles.name}
                h={"16px"}
                w={"20px"}
                alignSelf={"center"}
                colorPalette={"cyan"}
              />
            </HStack>
          ) : (
            <Text {...styles.statValue}>{data.weight}</Text>
          )}
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statLabel}>
            <GiBodyHeight />
          </Text>
          {isLoading ? (
            <HStack w={"full"} opacity={0.1}>
              <SkeletonText
                noOfLines={1}
                {...styles.name}
                h={"16px"}
                w={"20px"}
                alignSelf={"center"}
                colorPalette={"cyan"}
              />
            </HStack>
          ) : (
            <Text {...styles.statValue}>{data.height}</Text>
          )}
        </VStack>
        <VStack gap={0}>
          <Text {...styles.statLabel} fontWeight={"bold"}>
            XP
          </Text>
          {isLoading ? (
            <HStack w={"full"} opacity={0.1}>
              <SkeletonText
                noOfLines={1}
                {...styles.name}
                h={"16px"}
                w={"20px"}
                alignSelf={"center"}
                colorPalette={"cyan"}
              />
            </HStack>
          ) : (
            <Text {...styles.statValue}>{data.base_experience}</Text>
          )}
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
