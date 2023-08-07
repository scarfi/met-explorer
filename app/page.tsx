"use client"
import React, {ReactNode, useEffect, useState, useRef, useMemo, useCallback, SetStateAction} from 'react'
import { theme } from '../theme'
import {
  Image,
  Link,
  Input,
  Button,
  Box,
  Flex,
  Text,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
import Carousel from '../components/Carousel'
import Pagination from '../components/Pagination'
import {MetLogo} from '../Icons'
import {
  AddIcon,
  SmallCloseIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons'
import useViewport from '../hooks/useViewport'

const SIDEBAR_WIDTH = 250;

type FilterType = {
  [filterName: string]: string[],
}
type SortType = {
  category: string,
  descending: boolean,
}

type DepartmentType =
    "American Decorative Arts" |
    "Ancient Near Eastern Art" |
    "Arms and Armor" |
    "Arts of Africa, Oceania, and the Americas" |
    "Asian Art" |
    "The Cloisters" |
    "The Costume Institute" |
    "Drawings and Prints" |
    "Egyptian Art" |
    "European Paintings" |
    "European Sculpture and Decorative Arts" |
    "Greek and Roman Art" |
    "Islamic Art" |
    "The Robert Lehman Collection" |
    "The Libraries" |
    "Medieval Art" |
    "Musical Instruments" |
    "Photographs" |
    "Modern Art"

type ArtPieceType = {
  objectID: number,
  title?: string | null,
  artistDisplayName?: string | null,
  artistNationality?: string | null,
  department?: null | DepartmentType,
  objectName?: string | null,
  objectDate?: string | null,
  classification?: string | null,
  dimensions?: string | null,
  tags?: {term: string, AAT_URL: string}[] | null,
  culture?: string | null,
  period?: string | null,
  dynasty?: string | null,
  creditLine?: string | null,
  artistRole?: string | null,
  artistGener?: string | null,
  artistDisplayBio?: string | null,
  artistBeginDate?: number | null,
  artistEndDate?: number | null,
  primaryImage?: string | null,
  additionalImages?: string[] | null,
  repository?: string | null,
  accessionYear?: number | null,
  accessionNumber?: string | null,
  loading?: boolean,
}
// type GalleryType = ArtPieceType[]
type ViewTypesType = 'search' | 'collection'

type ResultsViewType = {
  type: ViewTypesType,
  searchTerm: string,
  collectionName: string,
  pageNumber: number,
  pageSize: number,
}

type ArtStoreType = {
  [objectID: number]: ArtPieceType,
}

type CollectionsType = {
  [name: string]: number[],
}

type SearchResultsType = {
  [searchTerm: string]: number[],
}

const buildTitle = (artPiece: ArtPieceType) => {
  return artPiece.title || artPiece.objectName || 'Untitled';
}

const buildSubtitle = (artPiece: ArtPieceType) => {
  if (artPiece.artistDisplayName && artPiece.artistDisplayBio) {
    return `${artPiece.artistDisplayName} (${artPiece.artistDisplayBio})`
  } else if (artPiece.artistDisplayName) {
    return artPiece.artistDisplayName;
  } else if (artPiece.culture) {
    return artPiece.culture;
  }
  return ''
}
const NewCollectionPopover = ({
  collections,
  addNewCollection,
  children,
}: {
  collections: CollectionsType,
  addNewCollection: Function,
  children: any,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const addCollection = (event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const targetValue = 'value' in event.target ? event.target.value : '';
    if (targetValue && !collections[targetValue]) {
      addNewCollection(targetValue);
    }
  }
  const inputRef = useRef<null | HTMLInputElement>(null);
  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>Create New Collection</PopoverHeader>
          <PopoverCloseButton
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <PopoverBody>
            <Input
              title="New Collection Name"
              ref={(element: HTMLInputElement) => {
                if (element) {
                  element.focus()
                  inputRef.current = element;
                }
              }}
              placeholder="Collection Name"
              onBlur={addCollection}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Escape') {
                  inputRef.current?.blur();
                  setIsOpen(false);
                } else if (e.key === 'Enter') {
                  addCollection(e);
                  setIsOpen(false);
                }
              }}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

const AddToCollectionPopover = ({
  objectID,
  collections,
  addItemToCollection,
  children,
}: {
  objectID: number,
  collections: CollectionsType,
  addItemToCollection: Function,
  children: any,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>Add to Collection</PopoverHeader>
          <PopoverCloseButton
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <PopoverBody>
            {Object.entries(collections).map((entry: [string, number[]], index: number) => {
              const [name, ids] = entry;
              return (
                <Button
                  key={name}
                  mr="2"
                  mb="2"
                  colorScheme='brand'
                  isDisabled={ids.indexOf(objectID) > -1 ? true : false}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    addItemToCollection(name, objectID);
                  }}
                >
                  {name}
                </Button>
              )
            })}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

const ConfirmDestructionPopover = ({
  confirm,
  confirmText = 'Remove',
  children,
}: {
  confirm: Function,
  confirmText: string,
  children: ReactNode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>Are You Sure?</PopoverHeader>
          <PopoverCloseButton
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <PopoverBody>
            <Button
              mr="2"
              colorScheme='brand'
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                confirm();
              }}
              margin="auto"
            >
              {confirmText}
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

const GalleryItem = ({
  objectID,
  artStore,
  viewType,
  searchTerm,
  collectionName,
  collections,
  addItemToCollection,
  removeItemFromCollection,
  setSearchResults,
  setArtStore,
  setFocused,
  focused,
  onModalOpen,
}: {
  objectID: number,
  artStore: ArtStoreType,
  viewType: ViewTypesType,
  collectionName: string,
  searchTerm: string,
  addItemToCollection: Function,
  removeItemFromCollection: Function,
  collections: CollectionsType,
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResultsType>>,
  setArtStore: React.Dispatch<React.SetStateAction<ArtStoreType>>,
  setFocused: React.Dispatch<React.SetStateAction<number>>,
  focused: boolean,
  onModalOpen: Function,
}) => {
  const [details, setDetails] = useState<ArtPieceType>(artStore[objectID] || {objectID, loading: false})
  const fetched = useRef(!!artStore[objectID]?.department)
  const title = buildTitle(details);
  const subtitle = buildSubtitle(details);
  const department = details.department || '';
  const borderColor = department ? (DEPARTMENTS[department] ? DEPARTMENTS[department].color : '#FFF') : '#FFF';
  const fetchItemDetails = async(id: number) => {
    setDetails({objectID: id, loading: true})
    try {
      const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
      let data: ArtPieceType = await res.json()
      // If the item has no image, it is removed from the search results
      if (!data.objectID || !data.primaryImage) {
        if (viewType === 'search') {
          setSearchResults((results: SearchResultsType) => {
            return {
              ...results,
              [searchTerm]: (results[searchTerm] || []).filter((itemId: number) => itemId !== id),
            }
          })
        }
        return
      }
      const {
        objectID,
        title,
        artistDisplayName,
        artistNationality,
        department,
        objectName,
        objectDate,
        classification,
        dimensions,
        tags,
        culture,
        period,
        dynasty,
        creditLine,
        artistRole,
        artistGener,
        artistDisplayBio,
        artistBeginDate,
        artistEndDate,
        primaryImage,
        additionalImages,
        repository,
        accessionYear,
        accessionNumber,
      } = data;
      data = {
        objectID,
        title,
        artistDisplayName,
        artistNationality,
        department,
        objectName,
        objectDate,
        classification,
        dimensions,
        tags,
        culture,
        period,
        dynasty,
        creditLine,
        artistRole,
        artistGener,
        artistDisplayBio,
        artistBeginDate,
        artistEndDate,
        primaryImage,
        additionalImages,
        repository,
        accessionYear,
        accessionNumber,
      }
      setDetails({
        ...data,
        loading: false,
      })
      setArtStore(artStore => {
        return {
          ...artStore,
          [id]: {
            ...data,
            loading: false,
          },
        }
      })
    } catch (e) {
      console.log('ERROR', e, objectID)
    }
  }
  useEffect(() => {
    if (!fetched.current && !artStore[objectID]?.department && !details.department) {
      fetched.current = true;
      fetchItemDetails(objectID);
    }
  }, [])
  return (            
    <Flex
      position="relative"
      tabIndex={0}
      width="220px"
      height="340px"
      borderRadius="10px"
      m="3"
      cursor="pointer"
      direction="column"
      alignItems={'center'}
      overflow="hidden"
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          setFocused(objectID);
          onModalOpen();
        }
      }}
      onClick={() => {
        setFocused(objectID);
        onModalOpen();
      }}
      sx={{
        boxShadow: `0 0 3px 3px ${focused ? '#982932' : '#888'}`,
        '&:hover': {
          boxShadow: '0 2px 4px 4px #999',
          transform: !details.loading && 'scale(1.01) translateY(-1px)',
          transition: 'box-shadow 200ms; transform 200ms',
        },
      }}
    >
      {details.loading
        ? <MetLogo />
        : <>
        <Flex
          flex="0 0 120px"
          width="100%"
          borderTop={`8px solid ${borderColor}`}
          borderRadius="10px 10px 0 0"
          direction="column"
          backgroundColor="#FFF"
        >
          <Text
            fontSize="16px"
            color={"#000"}
            width="100%"
            textOverflow={'ellipsis'}
            alignItems={'center'}
            overflow="hidden"
            whiteSpace={'nowrap'}
            flex="0 0 40px"
            px="3"
            py="2"
            pt="3"
          >
            {title}
          </Text>
          <Text
            fontSize="13px"
            color={"#333"}
            width="100%"
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow="hidden"
            flex="1 1 50px"
            alignItems={'center'}
            px="3"
            pb="2"
            sx={{
              lineClamp: 3,
              boxOrient: 'vertical',
            }}
          >
            {subtitle}
          </Text>
          </Flex>
          <Flex
            flex="0 0 220px"
            width="100%"
            backgroundColor="gray.700"
            backgroundImage={`url(${details.primaryImage || ''})`}
            alignItems={'center'}
            justifyContent={'center'}
            backgroundRepeat="no-repeat"
            backgroundSize="cover"
            backgroundPosition="top"
          >
          </Flex>
        </>
      }
      {viewType === 'collection' &&
      <ConfirmDestructionPopover
        confirmText="Remove from Collection"
        confirm={() => {
          removeItemFromCollection(collectionName, objectID);
        }}
      >
        <IconButton
          icon={<MinusIcon />}
          position="absolute"
          bottom="5px"
          left="5px"
          aria-label="Add to Collection"
          backgroundColor='rgba(255,255,255,0.4)'
          isRound={true}
          variant="outline"
          colorScheme="brand"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </ConfirmDestructionPopover>
      }
      <AddToCollectionPopover
        objectID={objectID}
        collections={collections}
        addItemToCollection={addItemToCollection}
      >
        <IconButton
          icon={<AddIcon />}
          position="absolute"
          bottom="5px"
          right="5px"
          aria-label="Add to Collection"
          backgroundColor='rgba(255,255,255,0.4)'
          isRound={true}
          variant="outline"
          colorScheme="brand"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </AddToCollectionPopover>
    </Flex>
  );
}

const Sidebar = ({
  small,
  sidebarOpen,
  collections,
  addNewCollection,
  viewType,
  viewCollectionName,
  setView,
}: {
  small: Boolean,
  sidebarOpen: Boolean,
  collections: CollectionsType,
  addNewCollection: Function,
  viewType: ViewTypesType,
  viewCollectionName: string,
  setView: React.Dispatch<SetStateAction<ResultsViewType>>,
}) => {
  return (
    <Flex id="sidebar"
      position={
        small ? 'absolute' : 'relative'
      }
      left={
        small ? (sidebarOpen ? 0 : `-${SIDEBAR_WIDTH}px`) : 0
      }
      userSelect="none"
      flex={`0 0 ${SIDEBAR_WIDTH}px`}
      width={`${SIDEBAR_WIDTH}px`}
      minWidth="0"
      h="100%"
      direction="column"
      backgroundColor="#FFF"
      alignItems={'center'}
      transition="flex 200ms"
    >
      <Flex
        flex='1 1 auto'
        maxHeight="100%"
        height="100%"
        direction="column"
        w="100%"
        borderRight="1px solid #DDD"
        alignItems='center'
        p="4"
        pt="3"
      >
        <Flex
          fontSize="18px"
          fontWeight="bold"
          flex="0 0 50px"
          alignItems={'center'}
          justifyContent={'space-between'}
          w="100%"
        >
          <Text>
            My Collections
          </Text>
          <NewCollectionPopover
            collections={collections}
            addNewCollection={addNewCollection}
          >
            <IconButton
              icon={<AddIcon />}
              aria-label="Add New Collection" 
              isRound={true}
              variant="outline"
              colorScheme="brand"
            >
            </IconButton>
          </NewCollectionPopover>
        </Flex>
        <Flex
          direction="column"
          w="100%"
          overflow="auto"
          minHeight="0"
          flex="1 1 auto"
        >
          {
          Object.entries(collections).map((entry: [string, number[]], index: number) => {
            const [name, ids] = entry;
            const selected = viewType === 'collection' && viewCollectionName === name;
            return (
              <Flex
                key={name}
                my="2"
                p="4"
                height="44px"
                borderRadius="5px"
                border="1px solid #DDD"
                w="100%"
                color={selected ? '#FFF' : '#000'}
                cursor={selected ? 'default' : 'pointer'}
                backgroundColor={selected ? '#EC012A' : '#FAFAFA'}
                alignItems="center"
                justifyContent={'space-between'}
                sx={{
                  '&:hover': selected ? {} : {
                    backgroundColor: '#F0F0F0',
                  }
                }}
                transition="background-color 200ms"
                onClick={() => {
                  if (viewType === 'collection' && viewCollectionName === name) return;
                  setView((currentView: ResultsViewType) => ({
                    ...currentView,
                    type: 'collection',
                    collectionName: name,
                    pageNumber: 1,
                  }))
                }}
              >
                <Text
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {name}
                </Text>
                <Text ml="1">{ids.length}</Text>
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function Home() {
  const {width, height} = useViewport();
  const [collections, setCollections] = useState<CollectionsType>({});
  useEffect(() => {
    const savedCollections = localStorage.getItem('metCollections');
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
  }, [])
  const [artStore, setArtStore] = useState<ArtStoreType>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState<number>(-1)
  const [searchResults, setSearchResults] = useState<SearchResultsType>({})
  const [view, setView] = useState<ResultsViewType>({
    type: 'search', 
    searchTerm: '',
    collectionName: '',
    pageNumber: 1,
    pageSize: 15,
  });
  const [editingCollectionName, setEditingCollectionName] = useState(false);

  // Mobile Responsive
  const small = width < 700;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Input Refs
  const searchInput = useRef<null | HTMLInputElement>(null);
  const renameCollectionInput = useRef<null | HTMLInputElement>(null);

  const addItemToCollection = useCallback((collectionName: string, objectID: number) => {
    const collection = collections[collectionName];
    if (!collection || collection.includes(objectID)) return;
    setCollections(collections => {
      const newData = {
        ...collections,
        [collectionName]: [...collection, objectID]
      }
      localStorage.setItem('metCollections', JSON.stringify(newData));
      return newData;
    })
  }, [JSON.stringify(collections)])

  // Updating Collections State
  const removeItemFromCollection = useCallback((collectionName: string, objectID: number) => {
    const collection = collections[collectionName];
    if (!collection || !collection.includes(objectID)) return;
    setCollections(collections => {
      const newData = {
        ...collections,
        [collectionName]: collection.filter(cId => cId !== objectID),
      };
      localStorage.setItem('metCollections', JSON.stringify(newData));
      return newData;
    })
  }, [JSON.stringify(collections)])

  const addNewCollection = (collectionName: string) => {
    setCollections(collections => {
      const newData = {
        ...collections,
        [collectionName]: [],
      }
      localStorage.setItem('metCollections', JSON.stringify(newData));
      return newData;
    })
  }

  const deleteCollection = (collectionName: string) => {
    setCollections(collections => {
      delete collections[collectionName]
      const newData = collections
      localStorage.setItem('metCollections', JSON.stringify(newData));
      return newData;
    })
    setView(currentView => ({
      ...currentView,
      type: "search",
    }))
  }

  const renameCollection = (collectionName: string, newName: string) => {
    if (newName === collectionName) return;
    setCollections(collections => {
      const items = [...collections[collectionName]];
      delete collections[collectionName]
      const newData = {
        ...collections,
        [newName]: items,
      }
      localStorage.setItem('metCollections', JSON.stringify(newData));
      return newData;
    })
    setView(currentView => ({
      ...currentView,
      collectionName: newName,
    }))
  }

  // Quries API for search results and stores ids in searchResults
  const search = async() => {
    if (!searchInput.current) return;
    let resultsIds: number[] = [];
    const searchTerm = searchInput.current.value;
    const storedResults = searchResults[searchTerm];
    if (storedResults) {
      // get results based on page number
      resultsIds = storedResults;
      if (view.searchTerm !== searchTerm) {
        setView(currentView => ({
          ...currentView,
          type: "search",
          searchTerm,
          pageNumber: 1,
        }))
      }
      return;
    } else {
      const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchTerm}`);
      let data = await res.json()
      setSearchResults(results => {
        return {
        ...results,
        [searchTerm]: data.objectIDs,
        }
      })
      setView(currentView => ({
        ...currentView,
        type: "search",
        searchTerm: searchTerm,
        pageNumber: 1,
      }))
    }
  }

  // List of art ids corresponding to view 
  const gallery: number[] = useMemo(() => {
    let gallery;
    if (view.type === 'search') {
      gallery = searchResults[view.searchTerm] ? searchResults[view.searchTerm] : [];
    } else {
      gallery = collections[view.collectionName] ? collections[view.collectionName] : [];
    }
    return gallery;
  }, [JSON.stringify(searchResults), view.type, view.searchTerm, view.collectionName]);
  
  const noResults = useMemo(() => {
    return (
      gallery.length === 0 &&
      view.type === "search" &&
      Object.keys(searchResults).includes(view.searchTerm)
    )
  }, [JSON.stringify(searchResults), view.searchTerm, view.type]);

  const {numPages, galleryPage} = useMemo(() => {
    const numPages = Math.ceil(gallery.length / view.pageSize);
    let galleryPage = gallery.slice((view.pageNumber - 1) * view.pageSize, (view.pageNumber) * view.pageSize)
    return {numPages, galleryPage, noResults};
  }, [JSON.stringify(gallery), JSON.stringify(searchResults), view.pageNumber, view.pageSize]);
  
  // If an art piece has no picture, it is removed.
  // For this reason, the number of pages can decrease as pieces are loaded
  useEffect(() => {
    if (view.pageNumber > numPages) {
      setView(currentView => ({
        ...currentView,
        pageNumber: Math.max(numPages, 1),
      }))
    }
  }, [numPages])

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const focusedArtPiece = useMemo(() => {
    return artStore[focused];
  }, [focused, JSON.stringify(artStore)])
  return (
    <ChakraProvider theme={theme}>
    <main>
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent
          border={`8px solid ${focusedArtPiece?.department ? (DEPARTMENTS[focusedArtPiece?.department]?.color || '#FFF') : '#FFF'}`}
          maxWidth="95vw"
          width="900px"
          backgroundColor="#FAFAFA"
        >
          {!small && <ModalCloseButton/>}
          <ModalBody py="5">
            {artStore[focused]?.additionalImages &&
              <Carousel
                primaryImage={artStore[focused]?.primaryImage || ''}
                additionalImages={artStore[focused]?.additionalImages || []}
              />
            }
            {Object.entries(focusedArtPiece || {}).map((entry: [string, any], index: number) => {
              let [key, value] = entry;
              if (['objectID', 'loading'].includes(key) || !value) return null
              let body = null;
              if (typeof value === 'string') {
                if (value.startsWith('http')) {
                  body = <>
                      <Link href={value} isExternal target="_blank">
                        {value}
                      </Link>
                    </>
                } else if (key === 'department') {
                  let color = '#FFF';
                  if (Object.keys(DEPARTMENTS).includes(value)) {
                    color = DEPARTMENTS[value].color;
                  }
                  body = <Flex alignItems="center">
                    <Text>{value}</Text>
                    <Box
                      ml="2"
                      width="15px"
                      height="15px"
                      borderRadius="50%"
                      backgroundColor={color}
                     > 
                    </Box>
                  </Flex>
                } else {
                  body = <>
                    <Text>{value}</Text>
                  </>
                }
              } else if (key === 'tags') {
                body = <>
                    <Text my="1" textOverflow="wrap">{JSON.stringify(value.map((tag: {[key: string]: string}) => tag?.term))}</Text>
                </>
              } else if (key === 'additionalImages' && value.length > 0) {
                body = <>
                  <Flex direction="column">
                    {value.map((image: string, index: number) => {
                      return (
                        <Link key={index} href={image} isExternal target="_blank">
                          {image}
                        </Link>
                      )
                    })}
                  </Flex>
                </>
              } else if (typeof value === 'object') {
                body = <>
                  <Text>{JSON.stringify(value)}</Text>
                </>
              } else {
                body = <>
                    <Text>{value}</Text>
                </>
              }
              key = ITEM_DISPLAY.displayNames[key] || key;
              return <Flex key={key} direction="column" my="1">
                <Text mr="1" fontWeight="bold">{`${key}:`}</Text>
                {body}
              </Flex>
            })}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex
        w="100vw"
        h="100vh"
        direction="column"
      >
        <Flex
          position="relative"
          flex="0 0 80px"
          backgroundColor={'#EC012A'}
          color='#FFF'
          p="5"
          alignItems="center"
          justifyContent={'center'}
        >
          {small &&
            <IconButton
              position="absolute"
              left="15px"
              top="20px"
              aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              icon={sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              size="md"
              variant="outline"
              colorScheme="white"
              onClick={() => {setSidebarOpen(!sidebarOpen)}}
            />
          }
          <Box
            width='40px'
            height='40px'
          >
          <MetLogo color="#FFF"/>
          </Box>
          <Text
            fontSize="24px"
            fontWeight='bold'
            ml="4"
            fontFamily='century gothic'
          >
            Collections Explorer
          </Text>
        </Flex>
        <Flex
          flex="1 1 auto"
          minHeight="0"
        >
          {!small &&
            <Sidebar
              small={small}
              sidebarOpen={sidebarOpen}
              collections={collections}
              addNewCollection={addNewCollection}
              viewType={view.type}
              viewCollectionName={view.collectionName}
              setView={setView}
            />
          }
          <Flex id="content"
            userSelect="none"
            flex="1 1 auto"
            minWidth="0"
            h="100%"
            backgroundColor="#FAFAFA"
            direction="column"
            position="relative"
          >
            <Flex
              flex="1 1 auto"
              w="100%"
              h="100%"
              overflowY="auto"
              flexWrap="wrap"
              justifyContent="space-around"
              p="2"
              pb="60px"
              pt="90px"
            >
              {noResults &&
                <Text mt="5">
                  NO RESULTS
                </Text>
              }
              {(view.type === 'search' && view.searchTerm === '') &&
                <Image
                  src="/met.jpeg"
                  alt="met-museum"
                  position="absolute"
                  left="50%"
                  top="50%"
                  borderRadius="10%"
                  boxShadow="0 0 3px 3px #982932"
                  transform="translate(-50%, -43%)"
                  width={`${Math.min(600, Math.min(width * .8, (height - 180) * .9))}px`}
                  height={`${Math.min(600, Math.min(width * .8, (height - 180) * .9))}px`}
                />
              }
              {galleryPage.map((objectID: number, index: number) => {
                return <GalleryItem
                  key={`item-${objectID}`}
                  objectID={objectID}
                  artStore={artStore}
                  viewType={view.type}
                  collectionName={view.collectionName}
                  collections={collections}
                  searchTerm={view.searchTerm}
                  addItemToCollection={addItemToCollection}
                  removeItemFromCollection={removeItemFromCollection}
                  setSearchResults={setSearchResults}
                  setArtStore={setArtStore}
                  setFocused={setFocused}
                  focused={focused === objectID}
                  onModalOpen={onModalOpen}
                />
              })}
            </Flex>
            {view.type === 'collection' && <>
              <Flex
                position="absolute"
                top="30px"
                left="30px"
                backgroundColor="#FAFAFA"
                opacity=".5"
              >
                <IconButton
                  icon={<ChevronLeftIcon width="1.25rem" height="1.25rem"/>}
                  aria-label="Exit Collection"
                  colorScheme={'brand'}
                  variant="outline"
                  size="md"
                  onClick={(() => {
                    setView(currentView => ({
                      ...currentView,
                      type: "search",
                      page: 1,
                    }))
                  })} 
                />
              </Flex>
              <Flex
                position="absolute"
                top="30px"
                right="30px"
                backgroundColor="#FAFAFA"
                opacity=".5"
              >
                <ConfirmDestructionPopover
                  confirmText="Delete Collection"
                  confirm={() => {
                    deleteCollection(view.collectionName);
                  }}
                >
                  <IconButton
                    icon={<SmallCloseIcon width="1.25rem" height="1.25rem"/>}
                    aria-label="Remove Collection"
                    colorScheme={'brand'}
                    variant="outline"
                    size="md"
                  />
                </ConfirmDestructionPopover>
                </Flex>
              <Flex
                position="absolute"
                top="20px"
                left="50%"
                transform="translateX(-50%)"
                alignItems={'center'}
                p="3"
                backgroundColor="#FAFAFA"
                opacity=".7"
                borderRadius="10px"
                border="1px solid #DDD"
              >
                {editingCollectionName
                ? <Input
                  type="text"
                  ref={(input: HTMLInputElement) => {
                    input?.focus();
                    renameCollectionInput.current = input;
                  }}
                  placeholder={view.collectionName}
                  defaultValue={view.collectionName}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    renameCollection(view.collectionName, e.target.value);
                    setEditingCollectionName(false);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Escape') {
                      if (renameCollectionInput.current) {
                        renameCollectionInput.current.blur();
                      }
                    } else if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      renameCollection(view.collectionName, target.value);
                      setEditingCollectionName(false);
                    }
                  }}
                />
                : <Text
                  fontSize="1.75rem"
                  fontWeight="semi-bold"
                  whiteSpace="nowrap"
                  mx="4"
                  cursor="pointer"
                  onClick={() => {
                    setEditingCollectionName(true);
                  }}
                >
                  {view.collectionName}
                </Text>
              }
              </Flex>
            </>}
            {view.type === 'search' &&
              <Flex
                position="absolute"
                top="25px"
                left="50%"
                width={small ? '90%' : 'auto'}
                maxWidth="300px"
                transform="translateX(-50%)"
              >
                <InputGroup size='lg'>
                  <Input 
                    ref={(input: HTMLInputElement) => {
                      input?.focus();
                      searchInput.current = input;
                    }}
                    type="text"
                    placeholder="show me dragons"
                    defaultValue={searchTerm}
                    minWidth="250px"
                    backgroundColor="rgba(255,255,255,0.5)"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Escape') {
                        searchInput.current?.blur();
                      } else if (e.key === 'Enter') {
                        search();
                      }
                    }}
                  />
                  <InputRightElement>
                    <Button variant="solid" colorScheme="brand" height="3rem" onClick={search}
                      borderRadius="0 5px 5px 0"
                    >
                      Go
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Flex>
            }
            {numPages > 1 &&
            <Box
              position="absolute"
              bottom="15px"
              left="50%"
              transform="translateX(-50%)"
            >
              <Pagination
                total={numPages}
                current={view.pageNumber}
                onChange={(pageNumber: number) => {
                  setView(currentView => ({
                    ...currentView,
                    pageNumber,
                  }))
                }}
              />
            </Box>
            }
          </Flex>
          {small &&
            <Sidebar
              small={small}
              sidebarOpen={sidebarOpen}
              collections={collections}
              addNewCollection={addNewCollection}
              viewType={view.type}
              viewCollectionName={view.collectionName}
              setView={setView}
            />
          }
        </Flex>
      </Flex>
    </main>
    </ChakraProvider>
  )
}

type DepartmentsType = {
  [key: string]: {
    departmentId: number,
    color: string,
  }
}
var DEPARTMENTS: DepartmentsType = {
  "American Decorative Arts": {
    departmentId: 1,
    color: "#D9ED92",
  },
  "The American Wing": {
    departmentId: 2,
    color: "#414073",
  },
  "Ancient Near Eastern Art": {
    departmentId: 3,
    color: "#76C893",
  },
  "Arms and Armor": {
    departmentId: 4,
    color: "#168AAD",
  },
  "Arts of Africa, Oceania, and the Americas": {
    departmentId: 5,
    color: "#184E77",
  },
  "Asian Art": {
    departmentId: 6,
    color: '#DE3C4B',
  },
  "The Cloisters": {
    departmentId: 7,
    color: "#240115",
  },
  "The Costume Institute": {
    departmentId: 8,
    color: "#F08080",
  },
  "Drawings and Prints": {
    departmentId: 9,
    color: "#FBC4AB",
  },
  "Egyptian Art": {
    departmentId: 10,
    color: "#CB997E",
  },
  "European Paintings": {
    departmentId: 11,
    color: "#FFE8D6",
  },
  "European Sculpture and Decorative Arts": {
    departmentId: 12,
    color: "#B7B7A4",
  },
  "Greek and Roman Art": {
    departmentId: 13,
    color: "#669BBC",
  },
  "Islamic Art": {
    departmentId: 14,
    color: "#C1121F",
  },
  "The Robert Lehman Collection": {
    departmentId: 15,
    color: "#7161EF",
  },
  "The Libraries": {
    departmentId: 16,
    color: "#DEC0F1",
  },
  "Medieval Art": {
    departmentId: 17,
    color: "#780000",
  },
  "Musical Instruments": {
    departmentId: 18,
    color: "#293241",
  },
  "Photographs": {
    departmentId: 19,
    color: "#E0FBFC",
  },
  "The Michael C. Rockefeller Wing": {
    departmentId: 20,
    color: "#E0BE36",
  },
  "Modern Art": {
    departmentId: 21,
    color: "#FDF0D5",
  },
}

type ItemDisplayType = {
  sortOrder: string[],
  displayNames: {
    [key: string]: string,
  },
}
var ITEM_DISPLAY: ItemDisplayType = {
  sortOrder: [
    'title',
    'artistDisplayName',
    'artistNationality',
    'department',
    'objectName',
    'objectDate',
    'classification',
    'dimensions',
    'tags',
    'culture',
    'period',
    'dynasty',
    'creditLine',
    'artistRole',
    'artistGender',
    'artistDisplayBio',
    'artistBeginDate',
    'artistEndDate',
    'primaryImage',
    'additionalImages',
    'repository',
    'accessionYear',
    'accessionNumber',
  ],
  displayNames: {
    'title': 'Title',
    'artistDisplayName': 'Artist',
    'artistNationality': 'Artist Nationality',
    'department': 'Department',
    'objectName': 'Object Name',
    'objectDate': 'Object Date',
    'classification': 'Classification',
    'dimensions': 'Dimensions',
    'tags': 'Tags',
    'culture': 'Culture',
    'period': 'Period',
    'dynasty': 'Dynasty',
    'creditLine': 'Credit Line',
    'artistRole': 'Artist Role',
    'artistGender': 'Artist Gender',
    'artistDisplayBio': 'Artist Bio',
    'artistBeginDate': 'Artist Begin Date',
    'artistEndDate': 'Artist End Date',
    'primaryImage': 'Primary Image',
    'additionalImages': 'Additional Images',
    'repository': 'Repository',
    'accessionYear': 'Accession Year',
    'accessionNumber': 'Accession Number',
  }
}