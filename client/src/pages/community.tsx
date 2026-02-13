import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Community() {
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState("");
    const { toast } = useToast();

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/forum/posts");
            if (res.ok) {
                setPosts(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePost = async () => {
        if (!newPost.trim()) return;
        try {
            const res = await fetch("/api/forum/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "New Discussion", // Simplified for this UI
                    content: newPost,
                    category: "General"
                })
            });
            if (!res.ok) throw new Error("Failed to post");
            setNewPost("");
            fetchPosts();
            toast({ title: "Posted successfully" });
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Could not create post" });
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-muted-foreground">Discuss strategies, markets, and tech with fellow investors.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => document.getElementById('post-input')?.focus()}>New Discussion</Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-4">
                        <div className="flex gap-4">
                            <Avatar>
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Input
                                    id="post-input"
                                    placeholder="What's on your mind? Share a trade idea..."
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={handlePost} disabled={!newPost}>
                                        <Send className="mr-2 h-4 w-4" /> Post
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {posts.length === 0 && <div className="text-center text-muted-foreground py-10">No posts yet. Be the first!</div>}

                    {posts.map(post => (
                        <Card key={post.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm">User</div>
                                        <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div>
                                    <Badge variant="outline" className="mb-2">{post.category}</Badge>
                                    <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                                    <p className="text-muted-foreground text-sm">{post.content}</p>
                                </div>
                                <Separator />
                                <div className="flex gap-6 text-sm text-muted-foreground">
                                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <ThumbsUp className="h-4 w-4" /> {post.likes || 0}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <MessageSquare className="h-4 w-4" /> Comments
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-primary transition-colors ml-auto">
                                        <Share2 className="h-4 w-4" /> Share
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card>
                        {/* Simplified sidebar content to save space */}
                        <CardHeader>
                            <div className="font-bold">Trending Topics</div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {["#Bitcoin", "#Starknet", "#YieldFarming", "#PrivacyPool", "#GreenEnergy"].map(tag => (
                                <div key={tag} className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{tag}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
