import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Input,
} from "@chakra-ui/react";

export default function SidebarFilters({ filters, onFilterChange }) {
  const handle = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.2)"
      rounded="xl"
      p={6}
      mb={6}
      boxShadow="0 8px 32px rgba(0,0,0,0.18)"
    >
      <Heading size="md" mb={4} color="primaryTxt" fontWeight="bold">
        Filters
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={6}>
        {/* Status Filter */}
        <FormControl>
          <FormLabel color="primaryTxt">Status</FormLabel>
          <Select
            name="status"
            value={filters.status}
            onChange={handle}
            bg="secondaryBg"
            color="primaryTxt"
            borderColor="rgba(255,255,255,0.2)"
            focusBorderColor="accent"
            rounded="lg"
          >
            <option value="">All</option>
            <option>Uploaded</option>
            <option>Converting</option>
            <option>Converted</option>
            <option>Error</option>
          </Select>
        </FormControl>

        {/* Type Filter */}
        <FormControl>
          <FormLabel color="primaryTxt">File Type</FormLabel>
          <Select
            name="type"
            value={filters.type}
            onChange={handle}
            bg="secondaryBg"
            color="primaryTxt"
            borderColor="rgba(255,255,255,0.2)"
            focusBorderColor="accent"
            rounded="lg"
          >
            <option value="">All Types</option>
            <option value=".png">PNG</option>
            <option value=".jpg">JPG</option>
            <option value=".svg">SVG</option>
            <option value=".pes">PES</option>
          </Select>
        </FormControl>

        {/* Search Filter */}
        <FormControl>
          <FormLabel color="primaryTxt">Search</FormLabel>
          <Input
            type="text"
            name="query"
            value={filters.query}
            onChange={handle}
            placeholder="Name…"
            bg="secondaryBg"
            color="primaryTxt"
            _placeholder={{ color: "gray.400" }}
            borderColor="rgba(255,255,255,0.2)"
            focusBorderColor="accent"
            rounded="lg"
          />
        </FormControl>
      </SimpleGrid>
    </Box>
  );
}