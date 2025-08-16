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
  const totalVotes: any = Object.values(votes).reduce((a, b) => a + b, 0);
  const getPercentage = (name: string) =>
    totalVotes === 0 ? 0 : Math.round((votes[name] / totalVotes) * 100);

  const winnerName = Object.entries(votes).reduce(
    (max: any, [name, count]: any) => (count > max[1] ? [name, count] : max),
    ["", -1]
  )[0];

  const winnerPokemon = pokemons.find((p) => p.name === winnerName);

  console.log(isOpen);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => onClose()}>
      <Dialog.Trigger asChild>
        <Button display="none">Open Stats</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            p={6}
            borderRadius="2xl"
            minW="sm"
            maxW="lg"
            shadow="lg"
          >
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top={2} right={2} />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <Heading size="md" mb={4} textAlign="center">
                Voting Results
              </Heading>
            </Dialog.Header>

            <Dialog.Body>
              {winnerPokemon && (
                <Box mb={6} textAlign="center">
                  <Text fontWeight="bold">Winner:</Text>
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
                    <Box key={p.name} w="100%">
                      <Text fontWeight="semibold" mb={1}>
                        {p.name} - {pct}%
                      </Text>
                      <Box
                        bg="gray.200"
                        h="24px"
                        borderRadius="md"
                        overflow="hidden"
                      >
                        <Box bg="blue.400" h="100%" w={`${pct}%`} />
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer mt={6} justifyContent="center">
              <Button onClick={onClose}>Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
