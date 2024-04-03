import { useEffect, useRef, useState } from 'react'
import { Container, FormControl, InputGroup, Button, Form, ListGroup, Alert, Spinner, Stack, DropdownButton, Dropdown } from 'react-bootstrap'
import useSWR from 'swr'
import { fetcher } from '@utils/swrUtils'
import { ResourceItem } from '@api/resources/list/[folder]'

const ResourcesPage = () => {
    const { data: resourcesFolders } = useSWR<string[]>('/api/resources-folders', fetcher)
    // const {data: resources} = useSWR<ResourceItem[]>('/api/resources/list/Resources',fetcher)
    const [resources, setResources] = useState<ResourceItem[]>()

    type Resource = {
        url: string
        folder: string
    }

    type Feedback = {
        variant: 'success' | 'warning' | 'danger',
        text: string
    }

    const [resource, setResource] = useState<Resource>({
        url: '',
        folder: 'Resources'
    })

    const getResources = async (folder?: string) => {
        const newResources = await fetcher('/api/resources/list/' + (folder ?? resource.folder), undefined)
        setResources(newResources)
    }

    useEffect(() => {
        getResources()
    }, [])

    const [feedback, setFeedback] = useState<Feedback>()
    const [uploading, setUploading] = useState<boolean>(false)

    const uploadResource = async (file: File) => {
        setFeedback(undefined)
        setUploading(true)
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetcher('/api/resources/upload/' + resource.folder, {
                method: 'POST',
                body: formData,
                redirect: 'follow',
            })
            console.log(response)
            if (response.stderr.includes('saved') || response.stdout.includes('saved')) {
                const savedFile = response.stderr.split('\n').filter((l: string) => l.includes('saved'))
                setFeedback({
                    text: 'Resource uploaded to server successfully: ' + savedFile,
                    variant: 'success'
                })
            } else {
                setFeedback({
                    text: 'Maybe an error occured. Check in the list for your resource, or try again. ' +
                        'Server said: ' + response.stderr,
                    variant: 'warning'
                })
            }
            setResource({
                ...resource,
                url: ''
            })
        } catch (error) {
            console.error(error)
            setFeedback({
                text: 'Failed to save resource to server: ' + String(error),
                variant: 'danger'
            })
        } finally {
            setUploading(false)
            getResources()
        }
    }

    type RenamedResource = {
        file: string,
        newName: string
    }

    const [renaming, setRenaming] = useState<RenamedResource>()

    const deleteResource = async (file: string) => {
        setFeedback(undefined)
        try {
            const response = await fetcher('/api/resources/delete/' + resource.folder, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                body: JSON.stringify({
                    file
                })
            })
            console.log(response)
            setFeedback({
                text: `Deleted resource from server: ${file}`,
                variant: 'success'
            })
        } catch (error) {
            console.error(error)
            setFeedback({
                text: 'Failed to delete resource from server: ' + String(error),
                variant: 'danger'
            })
        } finally {
            getResources()
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadResource(e.target.files[0]);
        }
    };

    return (
        <Container>
            {feedback && <Alert variant={feedback.variant}>{feedback.text}</Alert>}
            <InputGroup>
                <Form.Select aria-label="Resources folder" style={{ maxWidth: '250px' }} value={resource.folder} onChange={e => {
                    setResource({
                        ...resource,
                        folder: e.target.value
                    })
                    getResources(e.target.value)
                }}>
                    <option value="Client">Client</option>
                    <option value="Server">Server</option>
                    {(resourcesFolders ?? []).map(folder => <option key={folder}>{folder}</option>)}
                </Form.Select>
                <Button variant="outline-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? <Spinner animation="border" variant="primary" /> : 'Upload'}</Button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            </InputGroup>
            <ListGroup className="mt-3">
                {(resources ?? []).map(resource => <ListGroup.Item key={resource.file}>
                    <Stack direction="horizontal" gap={2}>
                        <DropdownButton title="Action" className="ms-auto" variant="outline-primary">
                            <Dropdown.Item onClick={() => deleteResource(resource.file)}>Delete</Dropdown.Item>
                        </DropdownButton>
                    </Stack>
                </ListGroup.Item>)}
            </ListGroup>
        </Container>
    );
}

export default ResourcesPage