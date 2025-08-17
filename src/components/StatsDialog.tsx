import {
  Dialog,
  Portal,
  Button,
  Box,
  VStack,
  Text,
  HStack,
  CloseButton,
  Heading,
} from "@chakra-ui/react";
import { PokeCard } from "./PokeCard";
import type { Pokemon, Votes } from "../types/pokemon";
import { resultsStyles as styles } from "./styles";

interface StatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pokemons: Pokemon[];
  votes: Votes;
}

export const StatsDialog = ({
  isOpen,
  onClose,
  pokemons,
  votes,
}: StatsDialogProps) => {
  const totalVotes: number = Object.values(votes).reduce((a, b) => a + b, 0);
  const getPercentage = (name: string) =>
    totalVotes === 0 ? 0 : Math.round((votes[name] / totalVotes) * 100);

  const winnerName = Object.entries(votes).reduce(
    (max: any, [name, count]: any) => (count > max[1] ? [name, count] : max),
    ["", -1]
  )[0];

  const winnerPokemon = pokemons.find((p) => p.name === winnerName);

  return (
    <Dialog.Root
      open={isOpen}
      placement={"center"}
      onOpenChange={() => onClose()}
    >
      <Dialog.Trigger asChild>
        <Button display="none">Open Stats</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content {...styles.dialogContent}>
            <Dialog.Header>
              <HStack {...styles.header}>
                <Heading {...styles.heading}>Voting Results</Heading>
                <Dialog.CloseTrigger asChild>
                  <CloseButton {...styles.closeButton} />
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              {winnerPokemon && (
                <Box {...styles.winnerBox}>
                  <Text {...styles.winnerText}>Winner:</Text>
                  <PokeCard
                    data={winnerPokemon}
                    votes={votes[winnerPokemon.name] || 0}
                    hasVoted={true}
                    onVote={() => {}}
                    isWinner={true}
                  />
                </Box>
              )}

              <VStack gap={4}>
                {pokemons.map((p) => {
                  const pct = getPercentage(p.name);
                  return (
                    <Box key={p.name} {...styles.resultBox}>
                      <Text {...styles.resultText}>
                        {p.name} - {pct}%
                      </Text>
                      <Box {...styles.progressBarBg}>
                        <Box {...styles.progressBarFill(pct)} />
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
